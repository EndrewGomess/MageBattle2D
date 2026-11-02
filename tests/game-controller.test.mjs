import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GameController
} from '../dist/game-controller.js';
const d20 = x => (x-.5)/20, d6=x=>(x-.5)/6;
function harness(samples=[d20(15),d20(8)],config={
  maxHealth:50,armorClass:12
}) {
  let now=0,calls=0,id=0;
  const jobs=new Map();
  const controller=new GameController({
    clock:()=>now,rng:()=>{
      if(!samples.length)throw Error('sem RNG');
      const x=samples.shift();
      calls++;
      if(x instanceof Error)throw x;
      return x;
    },schedule:fn=>{
      jobs.set(++id,fn);
      return id;
    },cancel:id=>jobs.delete(id)
  });
  const h={
    c:controller,samples,calls:()=>calls,jobs,at:t=>{
      now=(h.base||0)+t;
      controller.frame();
    },connect:()=>{
      const token=controller.beginSession();
      assert.equal(controller.connected(token),true);
      controller.frame();
    },step:()=>{
      const [id,fn]=jobs.entries().next().value;
      jobs.delete(id);
      now+=650;
      controller.frame();
      fn();
    },see:(result,token=controller.context(),age=0)=>{
      controller.frame();
      controller.observe(result,token,now-age);
    },hold:(spell='Victory',player=controller.engine.activePlayer)=>{
      const token=controller.context();
      for(const dt of [0,250,500,750,1000]){
        now+=dt===0?0:250;
        controller.frame();
        controller.observe(observation(spell,player),token,now);
      }
      return token;
    }
  };
  assert.equal(controller.start(config).valid,true);
  return h;
}
const observation=(spell='Victory',player=1)=>({
  landmarks:[Array.from({
    length:21
  },()=>({
    x:player===1?.8:.2,y:.5
  }))],gestures:[[{
    categoryName:spell,score:.99
  }]]
});
function combat(samples=[],config){
  const h=harness([d20(15),d20(8),...samples],config);
  h.connect();
  h.c.confirmFraming();
  h.step();
  h.step();
  h.step();
  assert.equal(h.c.phase,'gesture');
  h.base=1950;
  return h;
}
test('A01/A21: bloqueia configuração inválida e início sem recursos; uma câmera basta',()=>{
  const h=harness();
  const c=h.c;
  assert.equal(c.start({
    maxHealth:0,armorClass:20
  }).valid,false);
  assert.equal(c.phase,'preparation');
  c.confirmFraming();
  assert.equal(h.calls(),0);
  h.connect();
  assert.equal(h.calls(),0);
  c.confirmFraming();
  h.step();
  h.step();
  h.step();
  assert.equal(c.phase,'gesture');
  assert.equal(h.calls(),2);
});
test('A03/A18: empate e dado parcial da iniciativa sobrevivem a reconexão explícita',()=>{
  const h=harness([d20(11),d20(11),d20(15),d20(8)]);
  h.connect();
  h.c.confirmFraming();
  h.step();
  const obsolete=[...h.jobs.values()][0];
  h.c.suspend('stop');
  h.connect();
  assert.equal(h.calls(),1);
  obsolete();
  assert.equal(h.calls(),1);
  h.c.confirmFraming();
  h.step();
  h.step();
  h.step();
  h.step();
  assert.deepEqual(h.c.engine.initiative.rolls,[[11,11],[15,8]]);
  assert.equal(h.calls(),4);
});
test('A10/A14/A17: confirmação única, gesto sustentado e respostas do turno anterior',()=>{
  const h=combat([d20(13),d6(3),d6(4)]);
  const token=h.hold();
  assert.equal(h.c.engine.history.length,1);
  assert.equal(h.calls(),5);
  for(let i=0;i<10;i++)h.see(observation(),token);
  assert.equal(h.calls(),5);
  h.step();
  h.see(observation(),token);
  assert.equal(h.c.engine.history.length,1);
  h.hold('Victory',1);
  assert.equal(h.c.engine.history.length,1);
  assert.equal(h.c.progress,0);
});
test('A12: mudança, ausência, lacuna e observação velha reiniciam sem RNG',()=>{
  const h=combat();
  h.see(observation());
  h.at(250);
  h.see(observation());
  assert.ok(h.c.progress>0);
  h.at(500);
  h.see(observation('Pointing_Up'));
  assert.equal(h.c.progress,0);
  h.at(750);
  h.see({
    landmarks:[],gestures:[]
  });
  assert.equal(h.c.progress,0);
  h.see(observation());
  h.at(1400);
  h.see(observation());
  assert.equal(h.c.progress,0);
  h.at(1500);
  h.see(observation(),h.c.context(),501);
  assert.equal(h.c.progress,0);
  assert.equal(h.calls(),2);
});
test('região central, mão inativa e duas mãos ativas não confirmam (sintético)',()=>{
  for(const variant of ['central','inactive','two']) {
    const h=combat();
    let result=observation('Victory',variant==='inactive'?2:1);
    if(variant==='central')result.landmarks[0].forEach(p=>p.x=.5);
    if(variant==='two'){
      result.landmarks.push(result.landmarks[0]);
      result.gestures.push(result.gestures[0]);
    }
    for(let i=0;i<=5;i++){
      h.at(i*250);
      h.see(result);
    }
    assert.equal(h.c.progress,0);
    assert.equal(h.calls(),2);
  }
});
test('A18: falha em cada posição do RNG preserva d20/d6 e retoma somente faltantes',()=>{
  const values=[d20(20),d20(7),d6(2),d6(5)];
  for(let index=0;index<values.length;index++) {
    const samples=[...values];
    samples.splice(index,0,new Error('falha injetada'));
    const h=combat(samples);
    const token=h.hold('Pointing_Up');
    assert.equal(h.c.phase,'suspended');
    assert.equal(h.c.engine.history.length,0);
    const saved=h.c.lastRoll;
    assert.deepEqual(saved.attackValues,[20,7].slice(0,Math.min(index,2)));
    assert.deepEqual(saved.damageValues,[2,5].slice(0,Math.max(0,index-2)));
    h.connect();
    assert.equal(h.c.engine.history.length,0);
    h.see(observation('Pointing_Up'),token);
    h.c.confirmFraming();
    assert.equal(h.c.engine.history.length,1);
    assert.deepEqual(h.c.engine.history[0].attackValues,[20,7]);
    assert.deepEqual(h.c.engine.history[0].damageValues,[2,5]);
    assert.equal(h.c.engine.history[0].damage,8);
    assert.equal(h.calls(),7);
  }
});
test('A04/A16/A22: erro e Bola maximizada não geram d6; Raio crítico gera 4',()=>{
  for(const [spell,values,nominal,calls] of [['Victory',[d20(12)],0,3],['Open_Palm',[d20(20),d20(20)],52,4],['Victory',[d20(20),d6(1),d6(2),d6(3),d6(4)],12,7]]) {
    const h=combat(values);
    h.hold(spell);
    assert.equal(h.c.engine.history[0].nominalDamage,nominal);
    assert.equal(h.calls(),calls);
    if(nominal===52){
      assert.equal(h.c.phase,'result');
      assert.equal(h.c.engine.players[1].health,0);
      h.hold('Victory',2);
      assert.equal(h.calls(),calls);
    }
  }
});
test('A18: ocultar, vídeo congelado, callbacks antigos e dispose não resolvem ações',()=>{
  const h=combat();
  const old=h.c.context();
  h.see(observation());
  h.at(250);
  h.see(observation());
  h.c.visibility(false);
  assert.equal(h.c.phase,'suspended');
  h.c.visibility(true);
  h.at(300);
  assert.equal(h.c.phase,'suspended');
  h.c.confirmFraming();
  assert.equal(h.c.progress,0);
  h.see(observation(),old);
  assert.equal(h.c.progress,0);
  h.at(1000);
  h.c.lastFrameAt=400;
  h.c.watchdog();
  assert.equal(h.c.phase,'suspended');
  assert.equal(h.calls(),2);
  const newToken=h.c.context();
  h.c.dispose();
  assert.equal(h.c.current(newToken),false);
  h.see(observation(),newToken);
  assert.equal(h.calls(),2);
});
test('A19/A20: revanche limpa partida preservando recursos/config; menu invalida callbacks',()=>{
  const h=combat([d20(20),d20(20),d20(3),d20(18)]);
  h.hold('Open_Palm');
  assert.equal(h.c.phase,'result');
  const old=h.c.context();
  h.c.rematch();
  assert.deepEqual(h.c.engine.config,{
    maxHealth:50,armorClass:12
  });
  assert.deepEqual(h.c.engine.players,[{
    id:1,health:50
  },{
    id:2,health:50
  }]);
  assert.equal(h.c.engine.history.length,0);
  assert.equal(h.c.lastRoll,null);
  assert.equal(h.c.resources.camera,true);
  assert.equal(h.c.current(old),false);
  h.step();
  h.step();
  h.step();
  assert.equal(h.c.engine.activePlayer,2);
  h.c.menu();
  assert.equal(h.c.engine,null);
  assert.equal(h.c.phase,'menu');
  assert.equal(h.c.resources.camera,false);
  assert.equal(h.c.current(old),false);
});
test('A19: revanche sem recursos exige preparação sem RNG automático',()=>{
  const h=combat([d20(20),d20(20)]);
  h.hold('Open_Palm');
  h.c.suspend('stop',{
    camera:false,model:false
  });
  h.c.rematch();
  assert.equal(h.c.phase,'preparation');
  assert.equal(h.calls(),4);
  assert.equal(h.jobs.size,0);
});
test('tokens/callbacks anteriores ao menu e start não alteram a nova partida', () => {
  const h=combat([d20(13),d6(3),d6(4)]);
  const token=h.hold();
  const callback=[...h.jobs.values()][0];
  h.c.menu();
  h.c.start({
    maxHealth:70,armorClass:10
  });
  h.connect();
  assert.equal(h.c.current(token),false);
  callback();
  h.see(observation(),token);
  assert.equal(h.c.phase,'preparation');
  assert.equal(h.c.engine.history.length,0);
  assert.deepEqual(h.c.engine.players,[{
    id:1,health:70
  },{
    id:2,health:70
  }]);
  assert.equal(h.calls(),5);
});
test('iniciativa: falha RNG em qualquer posição retoma sem repetir dado válido', () => {
  for(const index of [0,1]) {
    const values=[d20(15),d20(8)];
    values.splice(index,0,new Error('falha iniciativa'));
    const h=harness(values);
    h.connect();
    h.c.confirmFraming();
    h.step();
    if(index===1)h.step();
    assert.equal(h.c.phase,'suspended');
    assert.deepEqual(h.c.pendingPair,index===0?[]:[15]);
    const calls=h.calls();
    h.connect();
    assert.equal(h.calls(),calls);
    h.c.confirmFraming();
    while(h.c.phase==='initiative')h.step();
    h.step();
    assert.deepEqual(h.c.engine.initiative.rolls,[[15,8]]);
    assert.equal(h.calls(),3);
  }
});
