import test from 'node:test';
import assert from 'node:assert/strict';
import { CaptureGate, GestureGate, activeGesture, parseD20, chooseOcrCandidate, summarize } from '../dist/core.js';
import { segment } from '../dist/segmentation.js';

const boxes = [{x:40,y:40,width:30,height:30},{x:140,y:40,width:30,height:30}];
function arm(gate, count=2) {
  gate.begin(count);
  for (const now of [0,300,600]) gate.observe({count:0},now);
  assert.equal(gate.phase,'armed');
}
function stabilize(gate, count=2) {
  for (const now of [750,1050,1350,1650]) gate.observe({count,boxes:boxes.slice(0,count)},now);
}

test('objetos antigos não armam a ação; área vazia é necessária',()=>{
  const gate = new CaptureGate(); gate.begin(2);
  for (const now of [0,300,600,900]) gate.observe({count:2,boxes},now);
  assert.equal(gate.phase,'empty'); assert.equal(gate.token(),null);
});
test('dois objetos distintos podem gerar uma única captura, mesmo com valores iguais',()=>{
  const gate = new CaptureGate(); arm(gate); stabilize(gate);
  const token = gate.token(); assert.notEqual(token,null);
  assert.equal(gate.consume(token),true); assert.equal(gate.consume(token),false);
  gate.observe({count:2,boxes},1800); assert.equal(gate.phase,'consumed');
  gate.begin(2); gate.observe({count:2,boxes},1900); assert.equal(gate.phase,'empty');
});
test('um dado não valida ação que exige dois; dado extra também bloqueia',()=>{
  for (const count of [1,3]) {
    const gate = new CaptureGate(); arm(gate); stabilize(gate,count);
    assert.equal(gate.token(),null);
  }
});
test('movimento, obstrução e cancelamento invalidam OCR atrasado',()=>{
  for (const reason of ['moving','obstructed','cancel']) {
    const gate = new CaptureGate(); arm(gate); stabilize(gate); const old=gate.token();
    if (reason === 'cancel') gate.cancel(); else gate.observe({count:2,boxes,[reason]:true},1800);
    assert.equal(gate.consume(old),false);
  }
});
test('intervalo sem observações não conta como estabilidade',()=>{
  const gate = new CaptureGate(); arm(gate); gate.observe({count:2,boxes},750);
  gate.observe({count:2,boxes},4000); assert.equal(gate.token(),null);
});
test('uma caixa duplicada não se passa por dois objetos físicos',()=>{
  const gate=new CaptureGate();arm(gate);
  for (const now of [750,1050,1350,1650]) gate.observe({count:2,boxes:[boxes[0],boxes[0]]},now);
  assert.equal(gate.token(),null);
});
test('d20 rejeita lixo, valores fora da faixa e múltiplos números',()=>{
  for (const text of ['0','21','1 8','18abc','1.5','09','']) assert.equal(parseD20(text),null);
  assert.equal(parseD20(' 20\n'),20); assert.equal(parseD20('9'),9);
});
test('OCR rejeita conflito 6/9 e escore insuficiente',()=>{
  assert.equal(chooseOcrCandidate([{value:6,confidence:95},{value:9,confidence:93}]).best,null);
  assert.equal(chooseOcrCandidate([{value:18,confidence:70}]).best,null);
  assert.equal(chooseOcrCandidate([{value:21,confidence:99}]).best,null);
  assert.equal(chooseOcrCandidate([{value:18,confidence:95},{value:18,confidence:90}]).best.value,18);
});
test('gesto inativo, mão no centro e duas mãos na região não confirmam',()=>{
  const hand=x=>Array.from({length:21},()=>({x,y:.5}));
  const category={categoryName:'Victory',score:.95};
  assert.equal(activeGesture({landmarks:[hand(.2)],gestures:[[category]]},1),null);
  assert.equal(activeGesture({landmarks:[hand(.5)],gestures:[[category]]},1),null);
  assert.equal(activeGesture({landmarks:[hand(.8),hand(.7)],gestures:[[category],[category]]},1),null);
  assert.equal(activeGesture({landmarks:[hand(.8)],gestures:[[category]]},1).categoryName,'Victory');
});
test('gesto exige observação contínua por 1 segundo e confirma só uma vez',()=>{
  const gate=new GestureGate(), category={categoryName:'Victory'};
  for (const now of [0,250,500,750]) assert.equal(gate.observe(category,now).confirmed,undefined);
  assert.equal(gate.observe(category,1000).fresh,true);
  assert.equal(gate.observe(category,1250).fresh,false);
  gate.reset(); gate.observe(category,0); assert.equal(gate.observe(category,2000).progress,0);
});
test('trocar ou perder gesto reinicia progresso',()=>{
  const gate=new GestureGate(); gate.observe({categoryName:'Victory'},0);gate.observe({categoryName:'Victory'},400);
  assert.equal(gate.observe({categoryName:'Open_Palm'},800).progress,0);
  assert.equal(gate.observe(null,1000).progress,0);
});
test('métricas incluem rejeições e preservam multiplicidade dos valores',()=>{
  const stats=summarize([{expected:[15,15],predicted:[15,15]},{expected:[15,15],predicted:[15]},{expected:[9],predicted:null},{expected:null,predicted:[9]}]);
  assert.equal(stats.attempts,3);assert.equal(stats.correct,1);assert.equal(stats.incorrect,1);assert.equal(stats.rejected,1);assert.equal(stats.accuracyAllAttempts,1/3);
});
test('segmentação conta componentes físicos distintos, sem usar seus números',()=>{
  const width=160,height=120,background=new Uint8ClampedArray(width*height*4),frame=background.slice();
  for (const start of [20,100]) for(let y=40;y<60;y++)for(let x=start;x<start+20;x++){const i=(y*width+x)*4;frame[i]=frame[i+1]=frame[i+2]=255;}
  const result=segment(frame,background,frame,width,height);
  assert.equal(result.count,2);assert.equal(result.moving,false);assert.equal(result.obstructed,false);
});
