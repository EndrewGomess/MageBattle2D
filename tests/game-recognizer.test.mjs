import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GameRecognizer
} from '../dist/game-recognizer.js';
class WorkerFake {
  static all=[];
  constructor(){
    WorkerFake.all.push(this);
    this.messages=[];
    this.terminated=false;
  }
  postMessage(message){
    this.messages.push(message);
  }
  terminate(){
    this.terminated=true;
  }
  reply(message){
    this.onmessage({
      data:message
    });
  }
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function loaded(t,onFailure){
  t.mock.method(globalThis,'Worker',WorkerFake);
  const r=new GameRecognizer(onFailure);
  t.after(()=>r.close());
  const promise=r.load();
  const w=WorkerFake.all.at(-1);
  w.reply({
    id:w.messages[0].id
  });
  await promise;
  return {
    r,w
  };
}
// Definir apenas APIs ausentes no Node; nenhum dispositivo real é utilizado.
if(!globalThis.Worker) globalThis.Worker=WorkerFake;
if(!globalThis.createImageBitmap) globalThis.createImageBitmap=()=>Promise.reject(Error('stub required'));
test('adapter: close rejeita requisição pendente e ignora resposta de worker anterior',async t=>{
  const {
    r,w
  }
  =await loaded(t);
  const request=r.request({
    type:'recognize'
  });
  const rejected=assert.rejects(request,/encerrado/);
  r.close();
  await rejected;
  assert.equal(w.terminated,true);
  assert.equal(r.pending.size,0);
  w.reply({
    id:w.messages.at(-1).id,result:{
      old:true
    }
  });
  assert.equal(r.ready,false);
  const next=r.load();
  const fresh=WorkerFake.all.at(-1);
  w.reply({
    id:fresh.messages[0].id
  });
  assert.equal(r.ready,false);
  fresh.reply({
    id:fresh.messages[0].id
  });
  await next;
  assert.equal(r.ready,true);
});
test('adapter: captura atrasada é fechada após cancelamento, sem postar quadro antigo',async t=>{
  const {
    r,w
  }
  =await loaded(t);
  let resolve;
  const bitmap={
    closed:0,close(){
      this.closed++;
    }
  };
  t.mock.method(globalThis,'createImageBitmap',()=>new Promise(r=>resolve=r));
  const pending=r.detect({});
  await tick();
  const rejected=assert.rejects(pending,/Captura/);
  r.close();
  await rejected;
  resolve(bitmap);
  await tick();
  assert.equal(bitmap.closed,1);
  assert.equal(w.messages.length,1);
  assert.equal(r.busy,false);
});
test('adapter: detect serializa inferência; erro do worker encerra e notifica uma vez',async t=>{
  let failures=0;
  const {
    r,w
  }
  =await loaded(t,()=>failures++);
  t.mock.method(globalThis,'createImageBitmap',async()=>({
    close(){}
  }));
  const pending=r.detect({});
  await tick();
  assert.equal(await r.detect({}),null);
  const rejected=assert.rejects(pending,/encerrado/);
  w.onerror();
  await rejected;
  w.onerror();
  assert.equal(failures,1);
  assert.equal(r.ready,false);
  assert.equal(r.busy,false);
});
test('adapter: erro de postMessage limpa pendência sem deixar timer vivo',async t=>{
  const {
    r,w
  }
  =await loaded(t);
  w.postMessage=()=>{
    throw Error('transfer failed');
  };
  await assert.rejects(r.request({
    type:'recognize'
  }),/transfer failed/);
  assert.equal(r.pending.size,0);
});
test('adapter: timeout de captura fecha bitmap tardio e timeout de inferência descarta resposta',async t=>{
  const {
    r,w
  }
  =await loaded(t);
  let resolve;
  const bitmap={
    closed:0,close(){
      this.closed++;
    }
  };
  t.mock.method(globalThis,'createImageBitmap',()=>new Promise(r=>resolve=r));
  const detection=r.detect({});
  await assert.rejects(detection,/Captura/);
  resolve(bitmap);
  await tick();
  assert.equal(bitmap.closed,1);
  assert.equal(r.busy,false);
  const request=r.request({
    type:'recognize'
  },[],5);
  const id=w.messages.at(-1).id;
  await assert.rejects(request,/tempo de espera/);
  assert.equal(r.pending.size,0);
  w.reply({
    id,result:{
      old:true
    }
  });
  assert.equal(r.pending.size,0);
});
