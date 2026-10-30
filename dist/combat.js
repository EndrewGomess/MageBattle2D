// Regras puras: os resultados dos dados são fornecidos pelo chamador.
export const DEFAULT_CONFIG = Object.freeze({ maxHealth: 50, armorClass: 12 });

export const COMBAT_SPELLS = Object.freeze({
  Pointing_Up: Object.freeze({ name: 'Mísseis Mágicos', dice: 2, selection: 'highest', damageDice: 1, bonus: 1 }),
  Victory: Object.freeze({ name: 'Raio de Fogo', dice: 1, selection: 'single', damageDice: 2, bonus: 2 }),
  Open_Palm: Object.freeze({ name: 'Bola de Fogo', dice: 2, selection: 'lowest', damageDice: 4, bonus: 4 })
});

export class CombatError extends Error {
  constructor(code, message, errors = {}) {
    super(message);
    this.name = 'CombatError';
    this.code = code;
    this.errors = Object.freeze({ ...errors });
  }
}

// Somente snapshots emitidos por esta instância do módulo são estados válidos.
const combatStates = new WeakSet();

function immutable(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(immutable);
    Object.freeze(value);
  }
  return value;
}

function combatState(value) {
  immutable(value);
  combatStates.add(value);
  return value;
}

function copyConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return null;
  const { maxHealth, armorClass } = config;
  return { maxHealth, armorClass };
}

function validateConfigCopy(config) {
  const errors = {};
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    errors.config = 'Informe uma configuração com vida máxima e CA.';
  } else {
    if (!Number.isSafeInteger(config.maxHealth) || config.maxHealth <= 0) {
      errors.maxHealth = 'A vida máxima deve ser um inteiro positivo representável com precisão.';
    }
    if (!Number.isInteger(config.armorClass) || config.armorClass < 1 || config.armorClass > 19) {
      errors.armorClass = 'A CA deve ser um inteiro de 1 a 19.';
    }
  }
  return immutable({ valid: Object.keys(errors).length === 0, errors });
}

export function validateConfig(config) {
  return validateConfigCopy(copyConfig(config));
}

export function createCombat(config) {
  const copied = copyConfig(config);
  const validation = validateConfigCopy(copied);
  if (!validation.valid) throw new CombatError('INVALID_CONFIG', 'Configuração inválida.', validation.errors);
  const { maxHealth, armorClass } = copied;
  return combatState({
    config: { maxHealth, armorClass },
    phase: 'initiative',
    players: [{ id: 1, health: maxHealth }, { id: 2, health: maxHealth }],
    initiative: { rolls: [], order: [] },
    turn: 0,
    activePlayer: null,
    winner: null,
    history: []
  });
}

function requirePhase(state, phase) {
  if (!combatStates.has(state)) {
    throw new CombatError('INVALID_STATE', 'Use um estado devolvido por este módulo de combate.');
  }
  if (state.phase !== phase) {
    throw new CombatError('INVALID_PHASE', 'Esta operação não está disponível na fase atual.');
  }
}

function copyDice(values, count, sides = 20) {
  if (!Array.isArray(values) || values.length !== count) {
    throw new CombatError('INVALID_VALUES', `Informe exatamente ${count} resultado(s) de d${sides}.`, { values: 'Quantidade incorreta de dados.' });
  }
  const copied = [];
  for (let index = 0; index < count; index++) {
    const value = values[index];
    if (!Number.isInteger(value) || value < 1 || value > sides) {
      throw new CombatError('INVALID_VALUES', `Cada d${sides} deve ser um inteiro de 1 a ${sides}.`, { values: 'Resultado de dado inválido.' });
    }
    copied[index] = value;
  }
  return copied;
}

export function applyInitiativeRoll(state, values) {
  requirePhase(state, 'initiative');
  const copied = copyDice(values, 2);
  const rolls = [...state.initiative.rolls, copied];
  if (copied[0] === copied[1]) {
    return combatState({ ...state, initiative: { rolls, order: [] } });
  }
  const first = copied[0] > copied[1] ? 1 : 2;
  return combatState({
    ...state,
    initiative: { rolls, order: [first, first === 1 ? 2 : 1] },
    phase: 'combat',
    turn: 1,
    activePlayer: first
  });
}

function requireSpell(spellId) {
  if (typeof spellId !== 'string' || !Object.hasOwn(COMBAT_SPELLS, spellId)) {
    throw new CombatError('INVALID_SPELL', 'Magia desconhecida.', { spell: 'Escolha uma das três magias.' });
  }
  return COMBAT_SPELLS[spellId];
}

function planFromCopy(spellId, values, armorClass) {
  const spell = COMBAT_SPELLS[spellId];
  const selected = spell.selection === 'lowest' ? Math.min(...values) : Math.max(...values);
  const hit = selected > armorClass, critical = hit && selected === 20;
  const maximized = critical && spellId === 'Open_Palm';
  const diceCount = hit ? spell.damageDice * (critical ? 2 : 1) : 0;
  return immutable({ values, selected, armorClass, hit, critical, maximized,
    damageDiceCount: diceCount, rollsRequired: maximized ? 0 : diceCount,
    bonus: hit ? spell.bonus : 0, maximizedComponent: maximized ? diceCount * 6 : 0,
    formula: hit ? `${diceCount}d6 + ${spell.bonus}` : '0 (erro)' });
}

// O controlador e o motor derivam o mesmo plano, sem aceitar flags do chamador.
export function planAttack(spellId, attackValues, armorClass) {
  const spell = requireSpell(spellId);
  if (!Number.isInteger(armorClass) || armorClass < 1 || armorClass > 19) {
    throw new CombatError('INVALID_CONFIG', 'A CA deve ser um inteiro de 1 a 19.');
  }
  return planFromCopy(spellId, copyDice(attackValues, spell.dice), armorClass);
}

export function resolveAction(state, action) {
  requirePhase(state, 'combat');
  if (!action || typeof action !== 'object' || Array.isArray(action)) {
    throw new CombatError('INVALID_ACTION', 'Informe atacante, magia e resultados dos dados.');
  }
  const { attacker, spell: spellId, attackValues, damageValues } = action;
  if (attacker !== state.activePlayer) {
    throw new CombatError('INVALID_ATTACKER', 'Somente o jogador ativo pode agir.', { attacker: 'Jogador não está ativo.' });
  }
  const spell = requireSpell(spellId);
  const values = copyDice(attackValues, spell.dice);
  const plan = planFromCopy(spellId, values, state.config.armorClass);
  const damageRolls = copyDice(damageValues, plan.rollsRequired, 6);
  const target = attacker === 1 ? 2 : 1;
  const defender = state.players.find(player => player.id === target);
  const nominalDamage = damageRolls.reduce((sum, value) => sum + value, plan.maximizedComponent) + plan.bonus;
  const damage = Math.min(defender.health, nominalDamage);
  const remainingHealth = defender.health - damage;
  const finished = remainingHealth === 0;
  const record = {
    turn: state.turn,
    attacker,
    target,
    spell: spellId,
    spellName: spell.name,
    ...plan,
    attackValues: values,
    damageValues: damageRolls,
    nominalDamage,
    appliedDamage: damage,
    damage
  };
  return combatState({
    ...state,
    players: state.players.map(player => player.id === target ? { ...player, health: remainingHealth } : player),
    phase: finished ? 'finished' : 'combat',
    turn: finished ? state.turn : state.turn + 1,
    activePlayer: finished ? null : target,
    winner: finished ? attacker : null,
    history: [...state.history, record]
  });
}
