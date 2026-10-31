import { createCombat, applyInitiativeRoll, resolveAction, validateConfig, COMBAT_SPELLS, planAttack } from './combat.js';
import { rollD20, rollD6 } from './dice.js';
import { GestureGate, activeGesture } from './core.js';
import { THRESHOLDS } from './config.js';

// Orquestração sem DOM. O motor permanece como snapshot original, nunca serializado.
export class GameController {
  constructor({ rng = Math.random, clock = () => performance.now(), schedule = (fn, ms) => setTimeout(fn, ms), cancel = id => clearTimeout(id), onChange = () => {} } = {}) {
    this.rng = rng; this.clock = clock; this.schedule = schedule; this.cancel = cancel; this.onChange = onChange;
    this.match = 0; this.session = 0; this.selection = 0; this.timer = null;
    this.engine = null; this.phase = 'menu'; this.gate = new GestureGate();
    this.resources = { camera: false, model: false, visible: true };
    this.lastFrameAt = -Infinity; this.progress = 0; this.spell = null; this.armed = false;
    this.pendingPair = []; this.pendingAction = null; this.lastRoll = null;
    this.message = 'Configure os atributos para começar.'; this.disposed = false;
  }
  context() {
    return Object.freeze({ match: this.match, session: this.session, selection: this.selection, turn: this.engine?.turn ?? 0, player: this.engine?.activePlayer ?? null });
  }
  current(token) {
    const actual = this.context();
    return !this.disposed && token && Object.keys(actual).every(key => token[key] === actual[key]);
  }
  view() {
    return Object.freeze({ engine: this.engine, phase: this.phase, resources: Object.freeze({ ...this.resources }), context: this.context(), progress: this.progress, spell: this.spell,
      pendingPair: Object.freeze([...this.pendingPair]), lastRoll: this.lastRoll, message: this.message, armed: this.armed });
  }
  emit() { if (!this.disposed) this.onChange(this.view()); }
  invalidate() {
    this.selection++; this.armed = false; this.gate.reset(); this.progress = 0; this.spell = null;
    if (this.timer !== null) this.cancel(this.timer);
    this.timer = null;
  }
  ready() {
    return this.resources.camera && this.resources.model && this.resources.visible && this.clock() - this.lastFrameAt <= THRESHOLDS.gestureMaxGapMs;
  }
  later(callback, delay = 650) {
    const token = this.context();
    this.timer = this.schedule(() => {
      if (!this.current(token)) return;
      this.timer = null;
      if (!this.ready()) { this.suspend('Recursos indisponíveis. Confira a webcam e retome explicitamente.'); return; }
      callback();
    }, delay);
  }
  start(config) {
    const copied = { maxHealth: config?.maxHealth, armorClass: config?.armorClass };
    const validation = validateConfig(copied);
    if (!validation.valid) return validation;
    const engine = createCombat(copied);
    this.invalidate(); this.match++; this.session++; this.engine = engine;
    this.resources.camera = false; this.resources.model = false; this.lastFrameAt = -Infinity;
    this.pendingPair = []; this.pendingAction = null; this.lastRoll = null; this.phase = 'preparation';
    this.message = 'Selecione uma webcam, conecte os recursos e confira o enquadramento.'; this.emit();
    return validation;
  }
  beginSession(reason = 'Preparando uma nova conexão.') {
    this.invalidate(); this.session++; this.resources.camera = false; this.resources.model = false; this.lastFrameAt = -Infinity;
    if (this.engine && !['menu', 'preparation', 'result'].includes(this.phase)) this.phase = 'suspended';
    this.message = reason; this.emit(); return this.context();
  }
  connected(token) {
    if (!this.current(token)) return false;
    this.resources.camera = true; this.resources.model = true;
    this.message = 'Recursos conectados. Confira a prévia e confirme o enquadramento para iniciar ou retomar.';
    this.emit(); return true;
  }
  frame() { if (!this.disposed) this.lastFrameAt = this.clock(); }
  watchdog() {
    if (this.resources.camera && this.clock() - this.lastFrameAt > THRESHOLDS.gestureMaxGapMs && !['menu', 'result', 'suspended'].includes(this.phase)) {
      this.suspend('Vídeo sem novos quadros. Aguarde a recuperação ou reconecte e retome explicitamente.');
    }
  }
  visibility(visible) {
    this.resources.visible = visible;
    if (!visible) this.suspend('A aba foi ocultada. Partida preservada; volte e confirme a retomada.');
    else this.emit();
  }
  suspend(reason, { camera = this.resources.camera, model = this.resources.model } = {}) {
    this.invalidate(); this.resources.camera = camera; this.resources.model = model;
    if (this.engine && this.engine.phase !== 'finished') this.phase = 'suspended';
    this.message = reason; this.emit();
  }
  confirmFraming() {
    if (!['preparation', 'suspended'].includes(this.phase) || !this.engine) return;
    if (!this.ready()) { this.message = 'Conecte a webcam e o reconhecedor e aguarde novos quadros antes de confirmar.'; this.emit(); return; }
    this.invalidate();
    if (this.pendingAction) { this.finishAction(); return; }
    if (this.engine.phase === 'initiative') {
      this.phase = 'initiative'; this.message = 'Iniciativa: um d20 para cada jogador. Maior resultado começa.';
      this.emit(); this.later(() => this.initiativeStep());
    } else if (this.engine.phase === 'combat') this.arm();
    else { this.phase = 'result'; this.emit(); }
  }
  initiativeStep() {
    if (this.phase !== 'initiative') return;
    try {
      // Cada callback sorteia só o próximo jogador; uma suspensão preserva o primeiro dado.
      this.pendingPair.push(rollD20(this.rng));
      if (this.pendingPair.length === 1) {
        this.message = `Jogador 1 rolou ${this.pendingPair[0]}. Aguardando o dado do jogador 2.`;
        this.emit(); this.later(() => this.initiativeStep()); return;
      }
      const pair = [...this.pendingPair];
      this.engine = applyInitiativeRoll(this.engine, pair); this.pendingPair = [];
      if (this.engine.phase === 'initiative') {
        this.message = `Empate: ${pair[0]} e ${pair[1]}. Novo par será gerado.`;
        this.emit(); this.later(() => this.initiativeStep());
      } else {
        this.message = `Jogador ${this.engine.activePlayer} começa. Prepare o gesto na região indicada.`;
        this.phase = 'nextTurn'; this.emit(); this.later(() => this.arm());
      }
    } catch (error) { this.suspend(`Falha na iniciativa: ${error.message}`); }
  }
  arm() {
    if (!this.ready()) { this.suspend('Confira os recursos e confirme a retomada.'); return; }
    this.invalidate(); this.phase = 'gesture'; this.armed = true;
    this.message = `Turno ${this.engine.turn}: jogador ${this.engine.activePlayer}, mantenha um único gesto na sua região.`; this.emit();
  }
  observe(result, token, capturedAt) {
    if (!this.current(token) || this.phase !== 'gesture' || !this.armed) return;
    if (!this.ready()) { this.suspend('Reconhecimento suspenso por falta de recursos ou quadros.'); return; }
    if (this.clock() - capturedAt > THRESHOLDS.gestureMaxGapMs) {
      this.gate.reset(); this.progress = 0; this.spell = null; this.emit(); return;
    }
    const category = activeGesture(result, token.player);
    const selection = this.gate.observe(category, capturedAt);
    this.progress = selection.progress || 0; this.spell = category?.categoryName ?? null;
    if (!selection.fresh) { this.emit(); return; }
    // Consumo antes do RNG: nenhum callback desta seleção pode executar outra ação.
    this.armed = false; this.selection++; this.phase = 'resolving';
    this.pendingAction = { attacker: token.player, spell: selection.confirmed, attackValues: [], damageValues: [],
      match: token.match, selection: token.selection, turn: token.turn };
    this.finishAction();
  }
  preserveRoll() {
    const action = this.pendingAction;
    if (!action) return;
    const spell = COMBAT_SPELLS[action.spell];
    this.lastRoll = Object.freeze({ ...action, player: action.attacker,
      attackValues: Object.freeze([...action.attackValues]), values: Object.freeze([...action.attackValues]),
      damageValues: Object.freeze([...action.damageValues]), plan: action.plan ?? null,
      selected: action.plan?.selected ?? null, attackCount: spell.dice,
      rule: spell.selection === 'highest' ? 'Vantagem: maior de 2d20' : spell.selection === 'lowest' ? 'Desvantagem: menor de 2d20' : 'Normal: 1d20' });
  }
  finishAction() {
    if (!this.pendingAction) return;
    this.phase = 'resolving';
    try {
      const action = this.pendingAction, spell = COMBAT_SPELLS[action.spell];
      // Cada resultado válido é guardado antes de solicitar o próximo dado.
      while (action.attackValues.length < spell.dice) action.attackValues.push(rollD20(this.rng));
      action.plan = planAttack(action.spell, action.attackValues, this.engine.config.armorClass);
      while (action.damageValues.length < action.plan.rollsRequired) action.damageValues.push(rollD6(this.rng));
      this.preserveRoll();
      this.engine = resolveAction(this.engine, this.pendingAction); this.pendingAction = null;
      if (this.engine.phase === 'finished') {
        this.invalidate(); this.phase = 'result'; this.message = `Jogador ${this.engine.winner} venceu!`; this.emit();
      } else {
        this.phase = 'nextTurn'; this.progress = 0; this.spell = null;
        this.message = 'Ação resolvida. Preparando automaticamente o próximo turno.'; this.emit(); this.later(() => this.arm());
      }
    } catch (error) {
      this.preserveRoll();
      this.suspend(`Ação suspensa: ${error.message}. Dados já gerados preservados; confirme a retomada para completar somente os dados faltantes e resolver.`);
    }
  }
  rematch() {
    if (!this.engine || this.engine.phase !== 'finished') return;
    const config = this.engine.config;
    this.invalidate(); this.match++; this.engine = createCombat(config); this.pendingPair = []; this.pendingAction = null; this.lastRoll = null;
    if (this.ready()) {
      this.phase = 'initiative'; this.message = 'Revanche: nova iniciativa com os mesmos atributos.'; this.emit(); this.later(() => this.initiativeStep());
    } else { this.phase = 'preparation'; this.message = 'Revanche preparada. Recupere a webcam e confirme o enquadramento.'; this.emit(); }
  }
  menu() {
    this.invalidate(); this.match++; this.session++; this.engine = null; this.pendingPair = []; this.pendingAction = null; this.lastRoll = null;
    this.resources.camera = false; this.resources.model = false; this.lastFrameAt = -Infinity; this.phase = 'menu'; this.message = 'Edite os atributos para iniciar uma nova partida.'; this.emit();
  }
  dispose() { this.invalidate(); this.match++; this.session++; this.disposed = true; }
}
