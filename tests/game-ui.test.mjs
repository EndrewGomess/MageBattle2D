import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readFile
} from 'node:fs/promises';
class Element {
  constructor(){
    this.value='';
    this.hidden=false;
    this.disabled=false;
    this.children=[];
    this.dataset={};
    this.style={};
    this.attributes={};
    this.events={};
    this.textContent='';
    this.classList={
      toggle(){},add(){},remove(){}
    };
    this.readyState=2;
    this.videoWidth=640;
    this.videoHeight=480;
    this.currentTime=0;
  }
  setAttribute(key,value){
    this.attributes[key]=value;
  }
  addEventListener(event,fn){
    this.events[event]=fn;
  }
  append(...items){
    this.children.push(...items);
  }
  prepend(item){
    this.children.unshift(item);
  }
  replaceChildren(...items){
    this.children=items;
  }
  closest(){
    return this;
  }
  pause(){}
  async play(){}
}
test('UI sintética A01/A20/A21: DOM mínimo, câmera única, falha, encerramento, pagehide/pageshow',async t=>{
  const html = await readFile(new URL('../dist/jogo.html', import.meta.url), 'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  const elements = new Map([...ids].map(id => [id, new Element()]));
  const get = id => {
    assert.ok(ids.has(id), 'ID ausente no HTML real: '+id);
    return elements.get(id);
  };
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const resource = match[1];
    if (resource.startsWith('#') || resource.startsWith('http')) continue;
    await readFile(new URL(resource, new URL('../dist/jogo.html', import.meta.url)));
  }
  get('maxHealth').value='50';
  get('armorClass').value='12';
  get('game-device').value='cam';
  get('game-resolution').value='640';
  get('game-video').parentElement={
    style:{}
  };
  const document={
    getElementById:get,createElement:()=>new Element(),createTextNode:text=>({
      textContent:text
    }),body:new Element(),documentElement:new Element(),hidden:false,events:{},addEventListener(name,fn){
      this.events[name]=fn;
    }
  };
  let reloaded=0,cleared=0,tick,request,failure=false,stops=0;
  const stream={
    getTracks:()=>[track],getVideoTracks:()=>[track]
  };
  const track={
    readyState:'live',muted:false,stop(){
      stops++;
      this.readyState='ended';
    },addEventListener(){},getSettings:()=>({
      deviceId:'cam'
    })
  };
  const media={
    addEventListener(){},removeEventListener(){},enumerateDevices:async()=>[{
      kind:'videoinput',deviceId:'cam',label:'Synthetic camera'
    }],getUserMedia:async options=>{
      request=options;
      if(failure){
        const e=new Error('negada');
        e.name='NotAllowedError';
        throw e;
      }
      return stream;
    }
  };
  const window={
    events:{},location:{
      reload(){
        reloaded++;
      }
    },addEventListener(name,fn){
      this.events[name]=fn;
    }
  };
  const descriptors=new Map();
  for(const [key,value] of Object.entries({
    document,window,navigator:{
      mediaDevices:media
    },Worker:class{
      postMessage(message){
        queueMicrotask(()=>this.onmessage({
          data:{
            id:message.id
          }
        }));
      }
      terminate(){}
    }
  })){
    descriptors.set(key,Object.getOwnPropertyDescriptor(globalThis,key));
    Object.defineProperty(globalThis,key,{
      value,configurable:true,writable:true
    });
  }
  t.after(()=>{
    for(const [key,descriptor] of descriptors){
      if(descriptor)Object.defineProperty(globalThis,key,descriptor);
      else delete globalThis[key];
    }
  });
  t.mock.method(globalThis,'setInterval',fn=>{
    tick=fn;
    return 42;
  });
  t.mock.method(globalThis,'clearInterval',id=>{
    assert.equal(id,42);
    cleared++;
  });
  await import('../dist/game-ui.js?synthetic-ui');
  assert.equal(get('start-game').disabled,false);
  assert.equal(document.body.dataset.phase,'menu');
  get('maxHealth').value='0';
  get('maxHealth').events.input();
  assert.equal(get('start-game').disabled,true);
  assert.equal(get('maxHealth').attributes['aria-invalid'],'true');
  assert.ok(get('maxHealth-error').textContent);
  get('maxHealth').value='50';
  get('maxHealth').events.input();
  get('config-form').events.submit({
    preventDefault(){}
  });
  await new Promise(r=>setImmediate(r));
  assert.equal(document.body.dataset.phase,'preparation');
  failure=true;
  await get('identify-camera').events.click();
  assert.equal(document.body.dataset.phase,'suspended');
  assert.match(get('game-message').textContent,/não foi autorizado/);
  assert.equal(get('identify-camera').disabled,false);
  assert.equal(request.audio,false);
  failure=false;
  await get('connect-resources').events.click();
  assert.equal(request.audio,false);
  assert.equal(request.video.deviceId.exact,'cam');
  assert.equal(get('confirm-framing').disabled,false,get('game-message').textContent);
  assert.equal(document.body.dataset.phase,'suspended');
  assert.ok(get('game-video').srcObject);
  tick();
  get('stop-camera').events.click();
  assert.ok(stops>0);
  assert.equal(get('game-video').srcObject,null);
  assert.equal(get('confirm-framing').disabled,true);
  get('menu-button').events.click();
  assert.equal(document.body.dataset.phase,'menu');
  assert.equal(get('maxHealth').value,'50');
  window.events.pageshow({
    persisted:false
  });
  assert.equal(reloaded,0);
  window.events.pagehide();
  assert.equal(cleared,1);
  window.events.pageshow({
    persisted:true
  });
  assert.equal(reloaded,1);
});
