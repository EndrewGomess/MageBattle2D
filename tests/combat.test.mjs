import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONFIG, COMBAT_SPELLS, CombatError, validateConfig, createCombat, applyInitiativeRoll, resolveAction } from '../dist/combat.js';

const spells = ['Pointing_Up', 'Victory', 'Open_Palm'];
const names = { Pointing_Up: 'Mísseis Mágicos', Victory: 'Raio de Fogo', Open_Palm: 'Bola de Fogo' };
const start = (config = DEFAULT_CONFIG, pair = [15, 8]) => applyInitiativeRoll(createCombat(config), pair);
const action = (spell = 'Victory', values = [13], attacker = 1) => ({ attacker, spell, values });
const healthOf = (state, player) => state.players.find(item => item.id === player).health;
const clone = value => structuredClone(value);

function expectError(fn, code) {
  assert.throws(fn, error => error instanceof CombatError && error.code === code && typeof error.message === 'string' && Object.isFrozen(error.errors));
}

function rejectedAction(state, candidate, code) {
  const before = clone(state);
  expectError(() => resolveAction(state, candidate), code);
  assert.deepEqual(state, before);
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.isFrozen(value), true);
  Object.values(value).forEach(assertDeepFrozen);
}

// Oráculo do dano usa aritmética inteira independente, inclusive além do dobro seguro de Number.
function expectedDamage(spell, base, life, hit = true) {
  if (!hit) return 0;
  const standard = BigInt(base);
  const nominal = spell === 'Pointing_Up' ? standard / 2n : spell === 'Open_Palm' ? standard * 2n : standard;
  return Number(nominal < BigInt(life) ? nominal : BigInt(life));
}

test('configuração padrão é explícita; estado inicial tem vida cheia e iniciativa pendente', () => {
  assert.deepEqual(DEFAULT_CONFIG, { maxHealth: 50, baseDamage: 10, armorClass: 12 });
  const state = createCombat(DEFAULT_CONFIG);
  assert.deepEqual(state, { config: DEFAULT_CONFIG, phase: 'initiative', players: [{ id: 1, health: 50 }, { id: 2, health: 50 }], initiative: { rolls: [], order: [] }, turn: 0, activePlayer: null, winner: null, history: [] });
  expectError(() => createCombat(), 'INVALID_CONFIG');
  assertDeepFrozen(state);
  assertDeepFrozen(DEFAULT_CONFIG);
  assertDeepFrozen(COMBAT_SPELLS);
});

test('A01: configuração inválida identifica cada campo e não aplica padrões silenciosos', () => {
  const invalid = [undefined, null, '', '10', '1.5', true, false, 0, -0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, {}, [], 1n];
  for (const field of ['maxHealth', 'baseDamage', 'armorClass']) {
    for (const value of invalid) {
      const config = { ...DEFAULT_CONFIG, [field]: value };
      const validation = validateConfig(config);
      assert.equal(validation.valid, false, `${field}: ${String(value)}`);
      assert.deepEqual(Object.keys(validation.errors), [field]);
      assertDeepFrozen(validation);
      expectError(() => createCombat(config), 'INVALID_CONFIG');
    }
  }
  const validation = validateConfig({ maxHealth: 0, baseDamage: 1.5, armorClass: 20 });
  assert.deepEqual(Object.keys(validation.errors), ['maxHealth', 'baseDamage', 'armorClass']);
  for (const config of [undefined, null, [], '50', 50, false]) {
    assert.deepEqual(Object.keys(validateConfig(config).errors), ['config']);
    expectError(() => createCombat(config), 'INVALID_CONFIG');
  }
});

test('configuração aceita CA 1/19 e inteiros positivos seguros; CA fora dos limites é rejeitada', () => {
  for (const armorClass of [1, 12, 19]) {
    for (const value of [1, 9, 10, Number.MAX_SAFE_INTEGER]) {
      const config = { maxHealth: value, baseDamage: value, armorClass };
      assert.equal(validateConfig(config).valid, true);
      assert.deepEqual(createCombat(config).config, config);
    }
  }
  for (const armorClass of [0, 20, Number.MAX_SAFE_INTEGER]) {
    assert.equal(validateConfig({ ...DEFAULT_CONFIG, armorClass }).valid, false);
  }
});

test('criação copia campos conhecidos e não congela nem altera configuração do chamador', () => {
  const config = { ...DEFAULT_CONFIG, extra: { mutable: true } };
  const before = clone(config);
  const state = createCombat(config);
  assert.deepEqual(config, before);
  assert.equal(Object.isFrozen(config), false);
  assert.equal(Object.isFrozen(config.extra), false);
  assert.deepEqual(Object.keys(state.config), ['maxHealth', 'baseDamage', 'armorClass']);
  config.maxHealth = 99;
  assert.equal(state.config.maxHealth, 50);
});

test('A02/A03: empates preservados e desempate inicia o jogador correto', () => {
  for (const decisive of [[15, 8], [8, 15]]) {
    const initial = createCombat(DEFAULT_CONFIG);
    const tied1 = applyInitiativeRoll(initial, [11, 11]);
    const tied2 = applyInitiativeRoll(tied1, [20, 20]);
    const state = applyInitiativeRoll(tied2, decisive);
    assert.equal(tied2.phase, 'initiative');
    assert.equal(tied2.turn, 0);
    assert.equal(tied2.activePlayer, null);
    assert.deepEqual(tied2.history, []);
    assert.deepEqual(state.initiative.rolls, [[11, 11], [20, 20], decisive]);
    const first = decisive[0] > decisive[1] ? 1 : 2;
    assert.deepEqual(state.initiative.order, [first, 3 - first]);
    assert.equal(state.activePlayer, first);
    assert.equal(state.turn, 1);
    assert.equal(state.phase, 'combat');
    assert.deepEqual(initial.initiative.rolls, []);
    assert.deepEqual(tied1.initiative.rolls, [[11, 11]]);
  }
});

test('iniciativa cobre todos os 400 pares possíveis de faces sem alterar vida', () => {
  const initial = createCombat(DEFAULT_CONFIG);
  for (let first = 1; first <= 20; first++) for (let second = 1; second <= 20; second++) {
    const state = applyInitiativeRoll(initial, [first, second]);
    assert.deepEqual(state.players, initial.players);
    assert.deepEqual(state.initiative.rolls, [[first, second]]);
    assert.equal(state.phase, first === second ? 'initiative' : 'combat');
    assert.equal(state.activePlayer, first === second ? null : first > second ? 1 : 2);
  }
});

test('iniciativa copia o par sem congelá-lo e rejeita dados inválidos atomicamente', () => {
  const state = createCombat(DEFAULT_CONFIG);
  const pair = [15, 8];
  const resolved = applyInitiativeRoll(state, pair);
  assert.equal(Object.isFrozen(pair), false);
  pair[0] = 1;
  assert.deepEqual(resolved.initiative.rolls, [[15, 8]]);
  const invalid = [undefined, null, {}, '15,8', [], [15], [15, 8, 1], new Array(2), [15, ,], [1, 0], [21, 1], [1.5, 2], ['15', 8], [NaN, 8], [Infinity, 8], [true, 8], [1n, 8]];
  for (const values of invalid) {
    const before = clone(state);
    expectError(() => applyInitiativeRoll(state, values), 'INVALID_VALUES');
    assert.deepEqual(state, before);
  }
});

test('estados forjados, clones e primitivas retornam INVALID_STATE sem percorrer a entrada', () => {
  const initial = createCombat(DEFAULT_CONFIG);
  const current = start();
  const cyclic = { phase: 'combat' }; cyclic.self = cyclic;
  const hostile = { phase: 'combat', get players() { throw new Error('Não deve ler players.'); } };
  for (const state of [undefined, null, 0, '', true, 1n, Symbol('state'), {}, [], { phase: 'initiative' }, { phase: 'combat' }, clone(initial), clone(current), JSON.parse(JSON.stringify(current)), cyclic, hostile]) {
    expectError(() => applyInitiativeRoll(state, [15, 8]), 'INVALID_STATE');
    expectError(() => resolveAction(state, action()), 'INVALID_STATE');
    if (state && typeof state === 'object') assert.equal(Object.isFrozen(state), false);
  }
});

test('operações em fases incorretas não alteram estados legítimos', () => {
  const initial = createCombat(DEFAULT_CONFIG);
  const combat = start();
  rejectedAction(initial, action(), 'INVALID_PHASE');
  const before = clone(combat);
  expectError(() => applyInitiativeRoll(combat, [20, 1]), 'INVALID_PHASE');
  assert.deepEqual(combat, before);
});

test('A04–A09/A15/A22/A23: cenários de magias e histórico completo', () => {
  const cases = [
    ['A04', 'Victory', [12], 10, 12, false, 0, 50],
    ['A05', 'Victory', [13], 10, 13, true, 10, 40],
    ['A06', 'Pointing_Up', [7, 18], 10, 18, true, 5, 45],
    ['A07', 'Open_Palm', [7, 18], 10, 7, false, 0, 50],
    ['A08', 'Open_Palm', [13, 20], 10, 13, true, 20, 30],
    ['A09', 'Pointing_Up', [15, 15], 10, 15, true, 5, 45],
    ['A15', 'Pointing_Up', [13, 20], 9, 20, true, 4, 46],
    ['A22', 'Victory', [20], 10, 20, true, 10, 40],
    ['A23', 'Pointing_Up', [13, 20], 1, 20, true, 0, 50]
  ];
  for (const [id, spell, values, baseDamage, selected, hit, damage, health] of cases) {
    const previous = start({ ...DEFAULT_CONFIG, baseDamage });
    const result = resolveAction(previous, action(spell, values));
    assert.equal(healthOf(result, 2), health, id);
    assert.equal(healthOf(result, 1), 50, id);
    assert.equal(result.activePlayer, 2, id);
    assert.equal(result.turn, 2, id);
    assert.deepEqual(result.history, [{ turn: 1, attacker: 1, target: 2, spell, spellName: names[spell], values, selected, armorClass: 12, hit, damage }], id);
    assert.deepEqual(previous.history, []);
  }
});

test('CA estrita e naturais: 380 combinações de uma face e CA, sem efeito especial', () => {
  for (let armorClass = 1; armorClass <= 19; armorClass++) {
    const previous = start({ maxHealth: 100, baseDamage: 10, armorClass });
    for (let face = 1; face <= 20; face++) {
      const state = resolveAction(previous, action('Victory', [face]));
      const record = state.history[0];
      assert.equal(record.selected, face);
      assert.equal(record.hit, face > armorClass);
      assert.equal(record.damage, face > armorClass ? 10 : 0);
      assert.equal(healthOf(state, 2), face > armorClass ? 90 : 100);
    }
  }
});

test('vantagem/desvantagem: 15.200 combinações de pares e CA usam maior/menor', () => {
  for (let armorClass = 1; armorClass <= 19; armorClass++) {
    const previous = start({ maxHealth: 100, baseDamage: 10, armorClass });
    for (const spell of ['Pointing_Up', 'Open_Palm']) {
      for (let first = 1; first <= 20; first++) for (let second = 1; second <= 20; second++) {
        const state = resolveAction(previous, action(spell, [first, second]));
        const ordered = [first, second].sort((a, b) => a - b);
        const expected = ordered[spell === 'Pointing_Up' ? 1 : 0];
        const record = state.history[0];
        assert.equal(record.selected, expected);
        assert.equal(record.hit, expected > armorClass);
        assert.deepEqual(record.values, [first, second]);
        assert.equal(record.damage, expectedDamage(spell, 10, 100, expected > armorClass));
      }
    }
  }
});

test('dano extremo e limite da vida: 105 combinações confrontadas com oráculo BigInt', () => {
  const maximum = Number.MAX_SAFE_INTEGER;
  const healths = [1, 5, 50, maximum - 1, maximum];
  const damages = [1, 9, 10, Math.floor(maximum / 2), Math.ceil(maximum / 2), maximum - 1, maximum];
  for (const maxHealth of healths) for (const baseDamage of damages) for (const spell of spells) {
    const state = resolveAction(start({ maxHealth, baseDamage, armorClass: 12 }), action(spell, spell === 'Victory' ? [20] : [20, 20]));
    const expected = expectedDamage(spell, baseDamage, maxHealth);
    assert.equal(state.history[0].damage, expected, `${maxHealth}/${baseDamage}/${spell}`);
    assert.equal(healthOf(state, 2), maxHealth - expected);
    assert.equal(Number.isSafeInteger(state.history[0].damage), true);
    assert.equal(state.phase, expected === maxHealth ? 'finished' : 'combat');
  }
});

test('A16: ataque fatal registra dano aplicado e bloqueia qualquer ação ou iniciativa posterior', () => {
  const previous = start({ maxHealth: 5, baseDamage: 10, armorClass: 12 }, [8, 15]);
  const won = resolveAction(previous, action('Victory', [13], 2));
  assert.equal(healthOf(won, 1), 0);
  assert.equal(healthOf(won, 2), 5);
  assert.equal(won.history[0].damage, 5);
  assert.equal(won.winner, 2);
  assert.equal(won.activePlayer, null);
  assert.equal(won.turn, 1);
  assert.equal(won.phase, 'finished');
  for (const attacker of [1, 2]) rejectedAction(won, action('Victory', [20], attacker), 'INVALID_PHASE');
  expectError(() => applyInitiativeRoll(won, [1, 20]), 'INVALID_PHASE');
});

test('erro e dano zero consomem turno, magias podem repetir e iniciativa permanece fixa', () => {
  let state = start({ ...DEFAULT_CONFIG, baseDamage: 1 }, [8, 15]);
  for (const [index, candidate] of [action('Victory', [12], 2), action('Pointing_Up', [13, 20], 1), action('Pointing_Up', [20, 20], 2), action('Victory', [13], 1)].entries()) {
    state = resolveAction(state, candidate);
    assert.equal(state.turn, index + 2);
    assert.equal(state.activePlayer, 3 - candidate.attacker);
    assert.deepEqual(state.initiative.order, [2, 1]);
    assert.equal(state.history[index].turn, index + 1);
  }
  assert.deepEqual(state.history.map(record => record.damage), [0, 0, 0, 1]);
  assert.deepEqual(state.history.map(record => record.hit), [false, true, true, true]);
});

test('ação ausente, jogador incorreto e magia inválida são rejeitados atomicamente', () => {
  const state = start();
  for (const candidate of [undefined, null, [], '', 1, true]) rejectedAction(state, candidate, 'INVALID_ACTION');
  for (const attacker of [undefined, null, 0, 2, 3, '1', true, NaN]) rejectedAction(state, { attacker, spell: 'Victory', values: [13] }, 'INVALID_ATTACKER');
  for (const spell of [undefined, null, '', 'victory', 'constructor', '__proto__', 'toString', ['Victory'], new String('Victory'), {}, true, Symbol('Victory')]) rejectedAction(state, { attacker: 1, spell, values: [13] }, 'INVALID_SPELL');
});

test('quantidade, tipo e faixa de todos os dados são validados antes de consumir ação', () => {
  const state = start();
  for (const spell of spells) {
    const count = spell === 'Victory' ? 1 : 2;
    for (const values of [undefined, null, {}, '13', [], new Array(count), Array(count + 1).fill(13), count === 1 ? [13, 13] : [13]]) rejectedAction(state, { attacker: 1, spell, values }, 'INVALID_VALUES');
    for (const invalid of [undefined, null, 0, -1, 21, 1.5, '13', true, NaN, Infinity, 1n]) {
      for (let index = 0; index < count; index++) {
        const values = Array(count).fill(13); values[index] = invalid;
        rejectedAction(state, action(spell, values), 'INVALID_VALUES');
      }
    }
  }
});

test('snapshots congelados, entradas copiadas e ação duplicada não altera próximo turno', () => {
  const config = { ...DEFAULT_CONFIG };
  const initiative = [15, 8];
  const state = applyInitiativeRoll(createCombat(config), initiative);
  const before = clone(state);
  const candidate = action('Pointing_Up', [7, 18]);
  const next = resolveAction(state, candidate);
  assert.deepEqual(state, before);
  assertDeepFrozen(next);
  assert.equal(Object.isFrozen(candidate), false);
  assert.equal(Object.isFrozen(candidate.values), false);
  assert.equal(Object.isFrozen(config), false);
  assert.equal(Object.isFrozen(initiative), false);
  candidate.values[1] = 1;
  assert.deepEqual(next.history[0].values, [7, 18]);
  assert.throws(() => { next.players[1].health = 0; }, TypeError);
  assert.throws(() => next.history.push({}), TypeError);
  assert.throws(() => { next.history[0].values[0] = 20; }, TypeError);
  rejectedAction(next, action('Pointing_Up', [7, 18]), 'INVALID_ATTACKER');
});

test('12 partidas determinísticas limitadas mantêm invariantes, histórico e reprodução idêntica', () => {
  let totalActions = 0;
  for (let game = 1; game <= 12; game++) {
    const config = { maxHealth: 67, baseDamage: 9, armorClass: 12 };
    let left = createCombat(config), right = createCombat(config);
    for (const values of [[1, 1], [20, 20], game % 2 ? [15, 8] : [8, 15]]) {
      left = applyInitiativeRoll(left, values); right = applyInitiativeRoll(right, values);
    }
    const life = { 1: 67, 2: 67 };
    let seed = game;
    const face = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % 20 + 1; };
    for (let turn = 1; turn <= 150 && left.phase !== 'finished'; turn++) {
      const spell = spells[(turn + game) % spells.length];
      const values = spell === 'Victory' ? [face()] : [face(), face()];
      const attacker = left.activePlayer, target = 3 - attacker;
      const ordered = [...values].sort((a, b) => a - b);
      const selected = spell === 'Pointing_Up' ? ordered.at(-1) : ordered[0];
      const damage = expectedDamage(spell, 9, life[target], selected > 12);
      life[target] -= damage;
      const before = clone(left);
      const candidate = { attacker, spell, values };
      const nextLeft = resolveAction(left, candidate), nextRight = resolveAction(right, clone(candidate));
      assert.deepEqual(left, before);
      assert.deepEqual(nextLeft, nextRight);
      assert.equal(nextLeft.history.length, turn);
      assert.deepEqual(nextLeft.history.at(-1), { turn, attacker, target, spell, spellName: names[spell], values, selected, armorClass: 12, hit: selected > 12, damage });
      assert.equal(healthOf(nextLeft, 1), life[1]);
      assert.equal(healthOf(nextLeft, 2), life[2]);
      assert.equal(nextLeft.activePlayer, life[target] === 0 ? null : target);
      assert.equal(nextLeft.winner, life[target] === 0 ? attacker : null);
      left = nextLeft; right = nextRight; totalActions++;
    }
    assert.equal(left.phase, 'finished');
  }
  assert.ok(totalActions > 12);
});

test('sequência limitada de 100 erros continua válida sem forçar vitória artificial', () => {
  let state = start();
  for (let turn = 1; turn <= 100; turn++) state = resolveAction(state, action('Victory', [1], state.activePlayer));
  assert.equal(state.phase, 'combat');
  assert.equal(state.winner, null);
  assert.equal(state.turn, 101);
  assert.equal(state.history.length, 100);
  assert.deepEqual(state.players, [{ id: 1, health: 50 }, { id: 2, health: 50 }]);
});

test('250 pares empatados permanecem registrados antes do desempate sem iniciar combate', () => {
  const initial = createCombat(DEFAULT_CONFIG);
  let state = initial;
  const expected = [];
  for (let attempt = 0; attempt < 250; attempt++) {
    const face = attempt % 20 + 1;
    expected.push([face, face]);
    state = applyInitiativeRoll(state, [face, face]);
    assert.equal(state.phase, 'initiative');
    assert.equal(state.turn, 0);
    assert.equal(state.activePlayer, null);
  }
  const resolved = applyInitiativeRoll(state, [8, 15]);
  assert.deepEqual(state.initiative.rolls, expected);
  assert.deepEqual(resolved.initiative.rolls, [...expected, [8, 15]]);
  assert.deepEqual(resolved.initiative.order, [2, 1]);
  assert.equal(resolved.turn, 1);
  assert.equal(resolved.activePlayer, 2);
  assert.deepEqual(resolved.history, []);
  assert.deepEqual(resolved.players, initial.players);
  assert.deepEqual(initial.initiative.rolls, []);
});

test('250 acertos de dano zero alternam turnos e preservam todo histórico sem falsa vitória', () => {
  let state = start({ ...DEFAULT_CONFIG, baseDamage: 1 });
  for (let turn = 1; turn <= 250; turn++) {
    state = resolveAction(state, action('Pointing_Up', [20, 20], state.activePlayer));
    assert.equal(state.history.length, turn);
    assert.equal(state.turn, turn + 1);
    assert.equal(state.activePlayer, turn % 2 === 1 ? 2 : 1);
  }
  assert.equal(state.phase, 'combat');
  assert.equal(state.winner, null);
  assert.deepEqual(state.players, [{ id: 1, health: 50 }, { id: 2, health: 50 }]);
  for (const [index, record] of state.history.entries()) {
    assert.equal(record.turn, index + 1);
    assert.equal(record.hit, true);
    assert.equal(record.damage, 0);
  }
});

test('P2: iniciativa copia índices validados sem consumir iterador que substitui dados', () => {
  const values = [15, 8];
  let calls = 0;
  values[Symbol.iterator] = function* () { calls++; yield 21; yield -1; };
  const initial = createCombat(DEFAULT_CONFIG);
  const state = applyInitiativeRoll(initial, values);
  assert.deepEqual(state.initiative.rolls, [[15, 8]]);
  assert.equal(state.activePlayer, 1);
  assert.equal(calls, 0);
  assert.deepEqual(initial.initiative.rolls, []);
  assert.equal(Object.isFrozen(values), false);
});

test('P2: ação copia índices validados sem consumir iterador que substitui dados', () => {
  const values = [13];
  let calls = 0;
  values[Symbol.iterator] = function* () { calls++; yield 0; };
  const previous = start();
  const state = resolveAction(previous, action('Victory', values));
  assert.deepEqual(state.history[0].values, [13]);
  assert.equal(state.history[0].selected, 13);
  assert.equal(state.history[0].hit, true);
  assert.equal(state.history[0].damage, 10);
  assert.equal(calls, 0);
  assert.deepEqual(previous.history, []);
  assert.equal(Object.isFrozen(values), false);
});

test('P2: iteradores que lançam não são chamados na iniciativa nem na ação', () => {
  let calls = 0;
  const iterator = () => { calls++; throw new Error('Iterador externo não deve ser consumido.'); };
  const pair = [8, 15]; pair[Symbol.iterator] = iterator;
  const faces = [7, 18]; faces[Symbol.iterator] = iterator;
  const started = applyInitiativeRoll(createCombat(DEFAULT_CONFIG), pair);
  const state = resolveAction(started, action('Pointing_Up', faces, 2));
  assert.deepEqual(started.initiative.rolls, [[8, 15]]);
  assert.deepEqual(state.history[0].values, [7, 18]);
  assert.equal(state.history[0].selected, 18);
  assert.equal(calls, 0);
});

test('P2: iniciativa lê cada índice uma vez e compara a mesma cópia registrada', () => {
  const reads = [0, 0];
  const values = [];
  Object.defineProperty(values, 0, { get: () => ++reads[0] === 1 ? 15 : 1, configurable: true });
  Object.defineProperty(values, 1, { get: () => ++reads[1] === 1 ? 8 : 20, configurable: true });
  const state = applyInitiativeRoll(createCombat(DEFAULT_CONFIG), values);
  assert.deepEqual(reads, [1, 1]);
  assert.deepEqual(state.initiative.rolls, [[15, 8]]);
  assert.equal(state.activePlayer, 1);
});

test('P2: ação lê cada índice uma vez antes de validar e resolver', () => {
  let reads = 0;
  const values = [];
  Object.defineProperty(values, 0, { get: () => ++reads === 1 ? 13 : 0, configurable: true });
  const state = resolveAction(start(), action('Victory', values));
  assert.equal(reads, 1);
  assert.deepEqual(state.history[0].values, [13]);
  assert.equal(state.history[0].hit, true);
});

test('P2: criação captura configuração uma vez antes de validar e emitir snapshot', () => {
  const reads = { maxHealth: 0, baseDamage: 0, armorClass: 0 };
  const config = {};
  for (const field of Object.keys(reads)) Object.defineProperty(config, field, { get: () => ++reads[field] < 3 ? DEFAULT_CONFIG[field] : 0 });
  const state = createCombat(config);
  assert.deepEqual(reads, { maxHealth: 1, baseDamage: 1, armorClass: 1 });
  assert.deepEqual(state.config, DEFAULT_CONFIG);
  assert.deepEqual(state.players, [{ id: 1, health: 50 }, { id: 2, health: 50 }]);
  assert.equal(Object.isFrozen(config), false);
});

test('P2: validateConfig público avalia uma leitura de cada campo externo', () => {
  const reads = { maxHealth: 0, baseDamage: 0, armorClass: 0 };
  const config = {};
  for (const field of Object.keys(reads)) Object.defineProperty(config, field, { get: () => ++reads[field] === 1 ? DEFAULT_CONFIG[field] : 0 });
  assert.deepEqual(validateConfig(config), { valid: true, errors: {} });
  assert.deepEqual(reads, { maxHealth: 1, baseDamage: 1, armorClass: 1 });
});

test('P2: ação captura atacante magia e array uma vez sem mudar seleção durante resolução', () => {
  for (const field of ['attacker', 'spell', 'values']) {
    const candidate = action();
    const original = candidate[field];
    const alternate = { attacker: 2, spell: 'Open_Palm', values: [0] }[field];
    let reads = 0;
    Object.defineProperty(candidate, field, { get: () => ++reads === 1 ? original : alternate, configurable: true });
    const previous = start();
    const state = resolveAction(previous, candidate);
    assert.equal(reads, 1, field);
    assert.deepEqual(state.history[0], { turn: 1, attacker: 1, target: 2, spell: 'Victory', spellName: 'Raio de Fogo', values: [13], selected: 13, armorClass: 12, hit: true, damage: 10 });
    assert.deepEqual(previous.history, []);
    assert.equal(Object.isFrozen(candidate), false);
  }
});
