// Dados do laboratório, sem dano ou motor de combate.
export function rollD20(rng = Math.random) {
  if (typeof rng !== 'function') throw new TypeError('A fonte aleatória deve ser uma função.');
  const value = rng();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('A fonte aleatória deve retornar um número de 0 (inclusive) a 1 (exclusive).');
  return Math.floor(value * 20) + 1;
}
export function rollForGesture(gesture, rng = Math.random) {
  const rules = { Pointing_Up: { count: 2, rule: 'Vantagem: maior de 2d20', select: Math.max }, Victory: { count: 1, rule: 'Normal: 1d20', select: Math.max }, Open_Palm: { count: 2, rule: 'Desvantagem: menor de 2d20', select: Math.min } };
  if (typeof gesture !== 'string' || !Object.hasOwn(rules, gesture)) throw new Error('Gesto sem magia correspondente.');
  const rule = rules[gesture];
  const values = Array.from({ length: rule.count }, () => rollD20(rng));
  return { gesture, values, selected: rule.select(...values), rule: rule.rule };
}
