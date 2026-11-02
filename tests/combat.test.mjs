import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CONFIG, COMBAT_SPELLS, CombatError, validateConfig, createCombat, applyInitiativeRoll, resolveAction, planAttack
} from '../dist/combat.js';
const start = (config = DEFAULT_CONFIG, pair = [15,8]) => applyInitiativeRoll(createCombat(config), pair);
const action = (spell='Victory', attackValues=[13], damageValues=[3,4], attacker=1) => ({
  attacker,spell,attackValues,damageValues
});
const frozen = x => {
  if(x && typeof x==='object') {
    assert.ok(Object.isFrozen(x));
    Object.values(x).forEach(frozen);
  }
};
const error = (fn, code) => assert.throws(fn, e => e instanceof CombatError && e.code===code && Object.isFrozen(e.errors));
const reject = (state,a,code) => {
  const before=structuredClone(state);
  error(()=>resolveAction(state,a),code);
  assert.deepEqual(state,before);
};
test('A01: configuração D18, limites, campos extras e snapshots',()=>{
  assert.deepEqual(DEFAULT_CONFIG,{
    maxHealth:50,armorClass:12
  });
  for(const field of ['maxHealth','armorClass']) for(const value of [undefined,null,'',true,false,0,-1,1.5,NaN,Infinity,{},[],1n]) {
    const config={
      ...DEFAULT_CONFIG,[field]:value
    };
    assert.equal(validateConfig(config).valid,false);
    error(()=>createCombat(config),'INVALID_CONFIG');
  }
  for(const config of [undefined,null,[],1,'50']) error(()=>createCombat(config),'INVALID_CONFIG');
  for(const armorClass of [1,19]) for(const maxHealth of [1,50,Number.MAX_SAFE_INTEGER]) {
    const c={
      maxHealth,armorClass
    };
    assert.deepEqual(createCombat(c).config,c);
  }
  for(const armorClass of [0,20]) assert.equal(validateConfig({
    ...DEFAULT_CONFIG,armorClass
  }).valid,false);
  assert.equal(validateConfig({
    ...DEFAULT_CONFIG,maxHealth:Number.MAX_SAFE_INTEGER+1
  }).valid,false);
  const input={
    ...DEFAULT_CONFIG,baseDamage:99,extra:{}
  };
  const state=createCombat(input);
  assert.deepEqual(state.config,DEFAULT_CONFIG);
  assert.equal(Object.isFrozen(input),false);
  input.maxHealth=99;
  assert.equal(state.players[0].health,50);
  frozen(state);
  frozen(COMBAT_SPELLS);
});
test('A02/A03: todos os 400 pares de iniciativa e empates preservados',()=>{
  const initial=createCombat(DEFAULT_CONFIG);
  for(let a=1;a<=20;a++) for(let b=1;b<=20;b++) {
    const s=applyInitiativeRoll(initial,[a,b]);
    assert.deepEqual(s.players,initial.players);
    assert.equal(s.activePlayer,a===b?null:a>b?1:2);
    assert.equal(s.phase,a===b?'initiative':'combat');
  }
  let s=initial;
  for(let i=0;i<250;i++) s=applyInitiativeRoll(s,[11,11]);
  s=applyInitiativeRoll(s,[8,15]);
  assert.equal(s.initiative.rolls.length,251);
  assert.deepEqual(s.initiative.order,[2,1]);
  assert.equal(s.turn,1);
  for(const pair of [null,[],[1],[1,2,3],[0,1],[1,21],[NaN,1],['15',8],new Array(2)]) error(()=>applyInitiativeRoll(initial,pair),'INVALID_VALUES');
});
const cases=[
['A04','Victory',[12],[],0,50,false],['A05','Victory',[13],[3,4],9,41,false],
['A06','Pointing_Up',[7,18],[4],5,45,false],['A07','Open_Palm',[7,18],[],0,50,false],
['A08','Open_Palm',[13,20],[1,2,3,4],14,36,false],['A09','Pointing_Up',[15,15],[5],6,44,false],
['A15','Pointing_Up',[7,13],[1],2,48,false],['A16','Open_Palm',[20,20],[],52,0,true],
['A22','Victory',[20],[1,2,3,4],12,38,true],['A23','Pointing_Up',[1,20],[2,5],8,42,true]
];
for(const [id,spell,attack,damage,nominal,health,critical] of cases) test(`${id}: dano D18, escolhido, histórico e transição`,()=>{
  const previous=start();
  const next=resolveAction(previous,action(spell,attack,damage));
  const r=next.history[0];
  assert.equal(r.selected,spell==='Open_Palm'?Math.min(...attack):Math.max(...attack));
  assert.equal(r.critical,critical);
  assert.equal(r.nominalDamage,nominal);
  assert.equal(r.appliedDamage,Math.min(50,nominal));
  assert.equal(next.players[1].health,health);
  assert.deepEqual(r.attackValues,attack);
  assert.deepEqual(r.damageValues,damage);
  assert.equal(r.bonus,nominal===0?0:spell==='Victory'?2:spell==='Pointing_Up'?1:4);
  assert.equal(next.activePlayer,health===0?null:2);
  assert.equal(next.winner,health===0?1:null);
  assert.equal(previous.history.length,0);
  frozen(next);
  if(!health) reject(next,action(),'INVALID_PHASE');
});
test('D18: enumeração de d20/CA com oráculo independente para as três magias',()=>{
  for(const ca of [1,12,19]) for(const spell of Object.keys(COMBAT_SPELLS)) for(let a=1;a<=20;a++) for(let b=1;b<=(spell==='Victory'?1:20);b++) {
    const attacks=spell==='Victory'?[a]:[a,b];
    const selected=spell==='Open_Palm'?Math.min(a,b):Math.max(...attacks);
    const hit=selected>ca,critical=selected===20;
    const normal=spell==='Pointing_Up'?1:spell==='Victory'?2:4;
    const bonus=normal;
    const count=hit?normal*(critical?2:1):0;
    const max=spell==='Open_Palm'&&critical;
    const dice=Array(max?0:count).fill(3);
    const expected=hit?(max?48:count*3)+bonus:0;
    const s=resolveAction(start({
      maxHealth:100,armorClass:ca
    }),action(spell,attacks,dice));
    assert.equal(s.history[0].nominalDamage,expected);
    assert.equal(s.history[0].critical,hit&&critical);
    assert.equal(s.players[1].health,100-expected);
  }
});
test('dados de dano: quantidade/faixa estritas; flags externas não alteram regras',()=>{
  const s=start();
  for(const attack of [undefined,null,[],[0],[21],['13'],[1.5],new Array(1)]) reject(s,{
    attacker:1,spell:'Victory',attackValues:attack,damageValues:[]
  },'INVALID_VALUES');
  for(const damage of [undefined,null,[],[1],[1,2,3],[0,1],[7,1],['3',4],[NaN,1],new Array(2)]) reject(s,{
    attacker:1,spell:'Victory',attackValues:[13],damageValues:damage
  },'INVALID_VALUES');
  reject(s,action('Victory',[12],[1]),'INVALID_VALUES');
  reject(s,action('Open_Palm',[20,20],[6]),'INVALID_VALUES');
  const next=resolveAction(s,{
    ...action(),critical:true,maximized:true,nominalDamage:999
  });
  assert.equal(next.history[0].nominalDamage,9);
  assert.equal(next.history[0].critical,false);
  error(()=>planAttack('Victory',[13],20),'INVALID_CONFIG');
  error(()=>planAttack('__proto__',[13],12),'INVALID_SPELL');
});
test('estados forjados, fases incorretas, atacante/magia inválidos: rejeição atômica',()=>{
  const s=start();
  const init=createCombat(DEFAULT_CONFIG);
  for(const x of [undefined,null,0,true,{},[],structuredClone(s),{
    get phase(){
      throw Error('não ler');
    }
  }]) error(()=>resolveAction(x,action()),'INVALID_STATE');
  reject(init,action(),'INVALID_PHASE');
  error(()=>applyInitiativeRoll(s,[15,8]),'INVALID_PHASE');
  for(const a of [undefined,null,[],1,true]) reject(s,a,'INVALID_ACTION');
  for(const attacker of [0,2,'1',null]) reject(s,{
    ...action(),attacker
  },'INVALID_ATTACKER');
  for(const spell of ['__proto__','constructor','toString','victory',null,Symbol()]) reject(s,{
    ...action(),spell
  },'INVALID_SPELL');
});
test('P2: captura cada campo/config/índice uma vez; ignora iteradores externos',()=>{
  for(const op of [validateConfig,createCombat]) {
    const reads={
      maxHealth:0,armorClass:0
    };
    const c={};
    for(const f of Object.keys(reads)) Object.defineProperty(c,f,{
      get:()=>++reads[f]===1?DEFAULT_CONFIG[f]:0
    });
    op(c);
    assert.deepEqual(reads,{
      maxHealth:1,armorClass:1
    });
  }
  const pair=[15,8];
  pair[Symbol.iterator]=()=>{
    throw Error('não iterar');
  };
  assert.equal(applyInitiativeRoll(createCombat(DEFAULT_CONFIG),pair).activePlayer,1);
  const reads=[0,0];
  const attacks=[];
  Object.defineProperty(attacks,0,{
    get:()=>++reads[0]===1?7:0
  });
  Object.defineProperty(attacks,1,{
    get:()=>++reads[1]===1?18:0
  });
  attacks[Symbol.iterator]=()=>{
    throw Error('não iterar');
  };
  let damageReads=0;
  const damage=[];
  Object.defineProperty(damage,0,{
    get:()=>++damageReads===1?4:0
  });
  damage[Symbol.iterator]=()=>{
    throw Error('não iterar');
  };
  const candidate=action('Pointing_Up',attacks,damage);
  const counts={};
  const getters={};
  for(const f of Object.keys(candidate)) Object.defineProperty(getters,f,{
    get:()=>{
      counts[f]=(counts[f]||0)+1;
      return counts[f]===1?candidate[f]:null;
    }
  });
  const s=resolveAction(start(),getters);
  assert.deepEqual(reads,[1,1]);
  assert.equal(damageReads,1);
  assert.deepEqual(counts,{
    attacker:1,spell:1,attackValues:1,damageValues:1
  });
  assert.equal(s.history[0].damage,5);
});
test('P2: iniciativa lê índices uma vez e usa a mesma cópia',()=>{
  const reads=[0,0],pair=[];
  Object.defineProperty(pair,0,{
    get:()=>++reads[0]===1?15:1
  });
  Object.defineProperty(pair,1,{
    get:()=>++reads[1]===1?8:20
  });
  const s=applyInitiativeRoll(createCombat(DEFAULT_CONFIG),pair);
  assert.deepEqual(reads,[1,1]);
  assert.deepEqual(s.initiative.rolls,[[15,8]]);
  assert.equal(s.activePlayer,1);
});
test('entradas copiadas e snapshot congelado; consumo duplicado bloqueado',()=>{
  const a=action();
  const previous=start();
  const next=resolveAction(previous,a);
  a.attackValues[0]=1;
  a.damageValues[0]=6;
  assert.deepEqual(next.history[0].attackValues,[13]);
  assert.deepEqual(next.history[0].damageValues,[3,4]);
  assert.equal(Object.isFrozen(a),false);
  assert.throws(()=>next.players[1].health=0,TypeError);
  reject(next,action(),'INVALID_ATTACKER');
});
test('partidas reproduzíveis e 100 erros preservam turnos/histórico; ataque fatal encerra',()=>{
  let s=start();
  for(let i=0;i<100;i++) s=resolveAction(s,action('Victory',[1],[],s.activePlayer));
  assert.equal(s.turn,101);
  assert.equal(s.phase,'combat');
  assert.deepEqual(s.players,[{
    id:1,health:50
  },{
    id:2,health:50
  }]);
  for(const life of [1,50,Number.MAX_SAFE_INTEGER]) {
    let left=start({
      maxHealth:life,armorClass:12
    }),right=start({
      maxHealth:life,armorClass:12
    });
    for(let i=0;i<12&&left.phase==='combat';i++){
      const a=action('Victory',[13],[3,4],left.activePlayer);
      left=resolveAction(left,a);
      right=resolveAction(right,a);
      assert.deepEqual(left,right);
      assert.ok(left.players.every(p=>p.health>=0));
    }
  }
});
test('D18: 12 partidas completas reproduzíveis com oráculo independente e invariantes por turno', () => {
  for (let seed = 1; seed <= 12; seed++) {
    let state = start({
      maxHealth:67,armorClass:12
    });
    let replay = start({
      maxHealth:67,armorClass:12
    });
    let random = seed;
    const nextFace = sides => {
      random = (Math.imul(random,1664525)+1013904223)>>>0;
      return random%sides+1;
    };
    const health = [67,67];
    for(let turn = 1; turn <= 150 && state.phase !== 'finished'; turn++) {
      const spell = ['Victory','Pointing_Up','Open_Palm'][(turn+seed)%3];
      const attacks = spell === 'Victory' ? [nextFace(20)] : [nextFace(20),nextFace(20)];
      const chosen = spell === 'Open_Palm' ? Math.min(...attacks) : Math.max(...attacks);
      const hit = chosen > 12;
      const critical = hit && chosen === 20;
      const baseCount = spell === 'Pointing_Up' ? 1 : spell === 'Victory' ? 2 : 4;
      const count = hit ? baseCount * (critical ? 2 : 1) : 0;
      const maximized = spell === 'Open_Palm' && critical;
      const damageValues = Array.from({
        length:maximized?0:count
      },()=>nextFace(6));
      const nominal = hit ? (maximized ? 48 : damageValues.reduce((a,b)=>a+b,0)) + baseCount : 0;
      const attacker = state.activePlayer;
      const target = 3-attacker;
      const applied = Math.min(health[target-1],nominal);
      health[target-1] -= applied;
      const candidate = action(spell,attacks,damageValues,attacker);
      const before = structuredClone(state);
      const next = resolveAction(state,candidate);
      replay = resolveAction(replay,structuredClone(candidate));
      assert.deepEqual(state,before);
      assert.deepEqual(next,replay);
      assert.deepEqual(next.players.map(p=>p.health),health);
      assert.equal(next.history.length,turn);
      const record = next.history.at(-1);
      assert.equal(record.nominalDamage,nominal);
      assert.equal(record.appliedDamage,applied);
      assert.equal(record.turn,turn);
      assert.equal(record.target,target);
      assert.equal(record.selected,chosen);
      assert.equal(next.turn,health[target-1]===0?turn:turn+1);
      assert.equal(next.activePlayer,health[target-1]===0?null:target);
      state=next;
    }
    assert.equal(state.phase,'finished');
    assert.ok(state.players.some(p=>p.health===0));
  }
});
