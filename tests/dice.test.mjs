import test from 'node:test';
import assert from 'node:assert/strict';
import { rollD20, rollForGesture } from '../dist/dice.js';

function sequence(values) {
  let calls = 0;
  return { rng: () => { assert.ok(calls < values.length, 'RNG recebeu chamada extra.'); return values[calls++]; }, calls: () => calls };
}
const sampleForFace = face => (face - 0.5) / 20;

test('d20 mapeia os 20 intervalos e extremos de [0,1) para inteiros 1..20', () => {
  for (let face = 1; face <= 20; face++) {
    assert.equal(rollD20(() => sampleForFace(face)), face);
    assert.equal(rollD20(() => (face - 1) / 20), face);
  }
  assert.equal(rollD20(() => 0), 1);
  assert.equal(rollD20(() => 1 - Number.EPSILON), 20);
});

test('RNG não função e amostras inválidas produzem erro claro', () => {
  for (const rng of [null, false, 1, 'rng', {}, []]) assert.throws(() => rollD20(rng), /fonte aleatória deve ser uma função/);
  for (const sample of [undefined, null, false, true, '', '0.5', {}, [], NaN, Infinity, -Infinity, -Number.EPSILON, 1, 1.5, 1n]) {
    let calls = 0;
    assert.throws(() => rollD20(() => { calls++; return sample; }), /fonte aleatória deve retornar um número/);
    assert.equal(calls, 1);
  }
});

test('exceção da fonte aleatória é preservada sem nova chamada', () => {
  const expected = new Error('RNG indisponível');
  let calls = 0;
  assert.throws(() => rollD20(() => { calls++; throw expected; }), error => error === expected);
  assert.equal(calls, 1);
});

test('A10: Raio gera exatamente um dado e mantém formato do laboratório', () => {
  for (let face = 1; face <= 20; face++) {
    const source = sequence([sampleForFace(face)]);
    const roll = rollForGesture('Victory', source.rng);
    assert.deepEqual(roll, { gesture: 'Victory', values: [face], selected: face, rule: 'Normal: 1d20' });
    assert.equal(source.calls(), 1);
  }
});

test('A11: vantagem/desvantagem fazem duas chamadas e usam maior/menor em 800 pares', () => {
  for (const gesture of ['Pointing_Up', 'Open_Palm']) {
    for (let first = 1; first <= 20; first++) for (let second = 1; second <= 20; second++) {
      const source = sequence([sampleForFace(first), sampleForFace(second)]);
      const roll = rollForGesture(gesture, source.rng);
      const ordered = [first, second].sort((a, b) => a - b);
      assert.deepEqual(roll.values, [first, second]);
      assert.equal(roll.selected, ordered[gesture === 'Pointing_Up' ? 1 : 0]);
      assert.equal(roll.gesture, gesture);
      assert.equal(roll.rule, gesture === 'Pointing_Up' ? 'Vantagem: maior de 2d20' : 'Desvantagem: menor de 2d20');
      assert.equal(source.calls(), 2);
    }
  }
});

test('dois valores iguais preservam duas chamadas e duas posições', () => {
  for (const gesture of ['Pointing_Up', 'Open_Palm']) {
    const source = sequence([sampleForFace(15), sampleForFace(15)]);
    assert.deepEqual(rollForGesture(gesture, source.rng).values, [15, 15]);
    assert.equal(source.calls(), 2);
  }
});

test('gestos inválidos e chaves herdadas são rejeitados antes de chamar RNG', () => {
  let calls = 0;
  const rng = () => { calls++; return 0; };
  for (const gesture of [undefined, null, '', 'victory', 'constructor', '__proto__', 'toString', ['Victory'], new String('Victory'), {}, true, Symbol('Victory')]) {
    assert.throws(() => rollForGesture(gesture, rng), /Gesto sem magia correspondente/);
  }
  assert.equal(calls, 0);
});

test('falha no segundo dado aborta a rolagem sem sortear novamente', () => {
  for (const gesture of ['Pointing_Up', 'Open_Palm']) {
    const source = sequence([sampleForFace(15), 1]);
    assert.throws(() => rollForGesture(gesture, source.rng), /fonte aleatória deve retornar um número/);
    assert.equal(source.calls(), 2);
  }
});

test('rolagens independentes retornam arrays distintos sem guardar seleção anterior', () => {
  const first = rollForGesture('Victory', () => sampleForFace(7));
  const second = rollForGesture('Victory', () => sampleForFace(18));
  assert.notEqual(first.values, second.values);
  first.values[0] = 1;
  assert.deepEqual(second.values, [18]);
  assert.equal(second.selected, 18);
});

test('fonte padrão é Math.random e mantém a quantidade de chamadas por magia', t => {
  let calls = 0;
  t.mock.method(Math, 'random', () => { calls++; return sampleForFace(13); });
  assert.equal(rollD20(), 13);
  assert.deepEqual(rollForGesture('Victory').values, [13]);
  assert.deepEqual(rollForGesture('Pointing_Up').values, [13, 13]);
  assert.deepEqual(rollForGesture('Open_Palm').values, [13, 13]);
  assert.equal(calls, 6);
});
