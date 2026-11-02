import test from 'node:test';
import assert from 'node:assert/strict';
import { Cameras } from '../dist/cameras.js';

function stream(id) {
  const track={readyState:'live',stopped:false,muted:false,listeners:{},getSettings:()=>({deviceId:id}),stop(){this.stopped=true;this.readyState='ended';},addEventListener(name,callback){this.listeners[name]=callback;}};
  return { track,getTracks:()=>[track],getVideoTracks:()=>[track] };
}
function media(open) { return { getUserMedia:open,enumerateDevices:async()=>[],addEventListener(){},removeEventListener(){} }; }
const assignment=(role,id)=>({role,id,width:640});

test('mesmo dispositivo é rejeitado antes de qualquer abertura',async()=>{
  let calls=0; const cameras=new Cameras(()=>{},media(async()=>{calls++;}));
  await assert.rejects(cameras.open([assignment('players','a'),assignment('dice','a')]),/distintas/); assert.equal(calls,0);
});
test('falha na segunda câmera encerra o primeiro fluxo',async()=>{
  const first=stream('a');let calls=0;
  const cameras=new Cameras(()=>{},media(async()=>{if(calls++ === 0)return first;throw new Error('ocupada');}));
  await assert.rejects(cameras.open([assignment('players','a'),assignment('dice','b')]),/ocupada/);
  assert.equal(first.track.stopped,true);assert.equal(cameras.streams.size,0);
});
test('stop durante abertura descarta fluxo que chega depois',async()=>{
  let resolve;const pending=new Promise(r=>{resolve=r;});const opened=stream('a');
  const cameras=new Cameras(()=>{},media(()=>pending));
  const opening=cameras.open([assignment('players','a')]);cameras.stop();resolve(opened);
  assert.equal(await opening,null);assert.equal(opened.track.stopped,true);assert.equal(cameras.streams.size,0);
});
test('dois seletores que retornam o mesmo hardware são rejeitados',async()=>{
  const streams=[stream('same'),stream('same')];let index=0;
  const cameras=new Cameras(()=>{},media(async()=>streams[index++]));
  await assert.rejects(cameras.open([assignment('players','a'),assignment('dice','b')]),/mesmo dispositivo/);
  assert.ok(streams.every(s=>s.track.stopped));
});
test('interrupção de uma câmera encerra os fluxos e notifica uma única vez',async()=>{
  const streams=[stream('a'),stream('b')];let index=0,failures=0;
  const cameras=new Cameras(()=>{failures++;},media(async()=>streams[index++]));
  await cameras.open([assignment('players','a'),assignment('dice','b')]);
  streams[0].track.listeners.mute();streams[1].track.listeners.ended();
  assert.equal(failures,1);assert.ok(streams.every(s=>s.track.stopped));
});

test('A21: uma webcam funciona sem segundo hardware e solicita somente vídeo', async () => {
 const opened=stream('only');let options;
 const cameras=new Cameras(()=>{},media(async input=>{options=input;return opened;}));
 const result=await cameras.open([assignment('players','only')]);
 assert.equal(result.size,1);assert.equal(result.get('players'),opened);assert.equal(options.audio,false);assert.equal(options.video.deviceId.exact,'only');cameras.dispose();assert.equal(opened.track.stopped,true);
});
test('permissão negada não mantém fluxos abertos',async()=>{
 const denied=Object.assign(new Error('denied'),{name:'NotAllowedError'});const cameras=new Cameras(()=>{},media(async()=>{throw denied;}));
 await assert.rejects(cameras.open([assignment('players','a')]),e=>e===denied);assert.equal(cameras.streams.size,0);assert.equal(cameras.opening,false);
});
