import test from 'node:test';
import assert from 'node:assert/strict';
import { segment } from '../dist/segmentation.js';

const width=160, height=120;
function blank(rgb=[220,220,220]) {
  const data=new Uint8ClampedArray(width*height*4);
  for (let k=0;k<data.length;k+=4) { data[k]=rgb[0];data[k+1]=rgb[1];data[k+2]=rgb[2];data[k+3]=255; }
  return data;
}
function rectangle(data,x,y,w,h,value) {
  for (let row=y;row<y+h;row++) for (let col=x;col<x+w;col++) { const k=(row*width+col)*4;data[k]=data[k+1]=data[k+2]=value; }
}

test('mesa vazia continua sem objetos após mudança uniforme de exposição',()=>{
  const background=blank([190,190,190]), frame=blank([235,235,235]);
  const result=segment(frame,background,background,width,height);
  assert.equal(result.count,0);assert.equal(result.obstructed,false);assert.equal(result.moving,false);
  assert.deepEqual(result.lightingOffset,[45,45,45]);
});
test('balanço de branco uniforme não cria objetos inexistentes',()=>{
  const background=blank([180,210,230]), frame=blank([225,220,210]);
  const result=segment(frame,background,background,width,height);
  assert.equal(result.count,0);assert.equal(result.moving,false);assert.equal(result.needsCalibration,false);
});
test('mancha de pouco contraste na mesa vazia é ignorada',()=>{
  const background=blank(), frame=background.slice();rectangle(frame,30,30,30,30,175);
  assert.equal(segment(frame,background,frame,width,height).count,0);
});
test('ruído pequeno de alto contraste não conta como um dado',()=>{
  const background=blank(), frame=background.slice();rectangle(frame,30,30,12,12,0);
  assert.equal(segment(frame,background,frame,width,height).count,0);
});
test('faixa fina não conta como um dado mesmo com área suficiente',()=>{
  const background=blank(), frame=background.slice();rectangle(frame,20,30,70,7,0);
  assert.equal(segment(frame,background,frame,width,height).count,0);
});
test('dois objetos contrastantes continuam separados após variação global de luz',()=>{
  const background=blank([200,200,200]), frame=blank([230,230,230]);
  rectangle(frame,20,40,22,22,60);rectangle(frame,100,40,22,22,60);
  const result=segment(frame,background,frame,width,height);
  assert.equal(result.count,2);assert.equal(result.obstructed,false);assert.equal(result.moving,false);
});
test('mudança extrema de iluminação exige calibração sem criar objetos',()=>{
  const background=blank([100,100,100]), frame=blank([220,220,220]);
  const result=segment(frame,background,frame,width,height);
  assert.equal(result.count,0);assert.equal(result.needsCalibration,true);assert.equal(result.obstructed,true);
});
test('movimento real de um objeto continua sendo detectado',()=>{
  const background=blank(), frame=background.slice();rectangle(frame,30,30,30,30,0);
  const result=segment(frame,background,background,width,height);
  assert.equal(result.count,1);assert.equal(result.moving,true);
});
