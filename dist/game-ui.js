import { GameController } from './game-controller.js';
import { GameRecognizer } from './game-recognizer.js';
import { Cameras, cameraError } from './cameras.js';
import { DEFAULT_CONFIG, validateConfig } from './combat.js';
import { SPELLS } from './core.js';

const $ = id => document.getElementById(id), video = $('game-video');
let active = null, operation = 0, busy = false, historyRendered = null, initiativeRendered = null;
const phases = { menu: 'Menu', preparation: 'Preparação', initiative: 'Iniciativa', gesture: 'Seleção de magia', resolving: 'Resolução', nextTurn: 'Próximo turno', suspended: 'Partida suspensa', result: 'Resultado' };
const controller = new GameController({ onChange: render });

function readConfig() {
  return Object.fromEntries(Object.keys(DEFAULT_CONFIG).map(key => {
    const text = $(key).value.trim(); return [key, /^\d+$/.test(text) ? Number(text) : NaN];
  }));
}
function configChanged() {
  const config = readConfig(), validation = validateConfig(config);
  for (const key of Object.keys(DEFAULT_CONFIG)) { $(key).setAttribute('aria-invalid', String(Boolean(validation.errors[key]))); $(`${key}-error`).textContent = validation.errors[key] || ''; }
  $('start-game').disabled = !validation.valid;
  $('damage-preview').textContent = 'Dano normal / crítico: Mísseis 1d6 + 1 / 2d6 + 1; Raio 2d6 + 2 / 4d6 + 2; Bola 4d6 + 4 / máximo de 8d6 + 4 = 52. Crítico exige d20 escolhido igual a 20 (ambos os d20 em Bola).';
  return { config, validation };
}
function release(resource) {
  if (!resource) return;
  if (active === resource) active = null;
  resource.recognizer.close(); resource.cameras.dispose();
  if (video.srcObject === resource.stream) { video.pause(); video.srcObject = null; }
}
function closeResources() { release(active); }
function failResource(resource, message) {
  if (active !== resource) return;
  release(resource); busy = false; operation++;
  controller.suspend(message, { camera: false, model: false });
}
async function devices(token = controller.context()) {
  if (!navigator.mediaDevices) throw new Error('Abra em localhost ou HTTPS em um navegador com suporte à webcam.');
  const list = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput');
  if (!controller.current(token)) return;
  const previous = $('game-device').value; $('game-device').replaceChildren();
  for (const [index, device] of list.entries()) {
    const option = document.createElement('option'); option.value = device.deviceId; option.textContent = device.label || `Webcam ${index + 1}`; $('game-device').append(option);
  }
  if (!list.length) { const option = document.createElement('option'); option.value = ''; option.textContent = 'Nenhuma webcam disponível'; $('game-device').append(option); }
  if (list.some(device => device.deviceId === previous)) $('game-device').value = previous;
}
async function identify() {
  const id = ++operation; busy = true;
  const token = controller.beginSession('Solicitando permissão para identificar a webcam.'); closeResources();
  try {
    if (!navigator.mediaDevices) throw new Error('O navegador não disponibilizou acesso à webcam. Use localhost ou HTTPS.');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    stream.getTracks().forEach(track => track.stop());
    if (!controller.current(token)) return;
    await devices(token);
  } catch (error) { if (controller.current(token)) controller.suspend(cameraError(error), { camera: false, model: false }); }
  finally { if (id === operation) { busy = false; render(controller.view()); } }
}
async function connect() {
  const id = ++operation; busy = true;
  const assignment = { role: 'players', id: $('game-device').value, width: Number($('game-resolution').value) };
  const token = controller.beginSession('Conectando webcam e carregando o reconhecedor de gestos.'); closeResources();
  const resource = { cameras: null, recognizer: null, stream: null, lastFrame: -1, loading: true };
  resource.cameras = new Cameras(message => failResource(resource, message));
  resource.recognizer = new GameRecognizer(message => failResource(resource, message));
  active = resource;
  const current = () => active === resource && id === operation && controller.current(token);
  try {
    const streams = await resource.cameras.open([assignment]);
    if (!streams || !current()) { release(resource); return; }
    resource.stream = streams.get('players'); video.srcObject = resource.stream;
    await video.play();
    if (!current()) { release(resource); return; }
    video.parentElement.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
    await resource.recognizer.load();
    if (!current()) { release(resource); return; }
    resource.loading = false; controller.connected(token);
  } catch (error) { if (current()) failResource(resource, cameraError(error)); else release(resource); }
  finally { if (id === operation) { busy = false; render(controller.view()); } }
}
function stop() {
  operation++; busy = false; closeResources();
  controller.beginSession('Webcam encerrada ou configuração alterada. Reconecte e confirme o enquadramento para retomar.');
}
function toMenu() { operation++; busy = false; closeResources(); controller.menu(); configChanged(); }
async function tick() {
  const resource = active;
  if (!resource || document.hidden) return;
  const track = resource.stream?.getVideoTracks()[0];
  if (!resource.loading && (track?.readyState !== 'live' || track.muted || !resource.recognizer.ready)) {
    failResource(resource, 'Webcam ou reconhecedor indisponível. Reconecte e retome explicitamente.'); return;
  }
  if (track?.readyState === 'live' && !track.muted && video.readyState >= 2 && video.currentTime !== resource.lastFrame) {
    resource.lastFrame = video.currentTime; controller.frame();
    const view = controller.view();
    if (view.phase === 'gesture' && view.armed && resource.recognizer.ready && !resource.recognizer.busy) {
      const token = controller.context(), capturedAt = performance.now();
      try {
        const result = await resource.recognizer.detect(video);
        if (active === resource && controller.current(token) && result) controller.observe(result, token, capturedAt);
      } catch (error) { if (active === resource && controller.current(token)) failResource(resource, error.message); }
    }
  }
  controller.watchdog();
}
function text(id, content) { $(id).textContent = content; }
function damageDetail(record) {
  if (!record.hit) return 'Erro: nenhum d6 gerado; dano nominal 0; aplicado 0.';
  const component = record.maximized ? `componente maximizado ${record.maximizedComponent}, sem rolagem de d6` : `d6: ${record.damageValues.join(', ')}`;
  return `${record.critical ? 'Crítico natural' : 'Acerto normal'} · ${record.formula} · ${component} · bônus +${record.bonus} · dano nominal ${record.nominalDamage}; aplicado ${record.appliedDamage}.`;
}
function appendLogRecord(record, opened) {
  const entry = document.createElement('details'); entry.className = `combat-entry ${record.hit ? record.critical ? 'critical' : 'hit' : 'miss'}`;
  entry.dataset.turn = String(record.turn); entry.open = opened.has(record.turn);
  const summary = document.createElement('summary');
  const turn = document.createElement('span'); turn.className = 'log-turn'; turn.textContent = `[T${String(record.turn).padStart(2, '0')}] `;
  const result = document.createElement('span'); result.className = 'log-result'; result.textContent = ` · ${record.hit ? record.critical ? 'Crítico' : 'Acerto' : 'Erro'} · ${record.appliedDamage} de dano`;
  summary.append(turn, document.createTextNode(`Jogador ${record.attacker} · ${record.spellName}`), result); entry.append(summary);
  const details = document.createElement('dl');
  for (const [label, value] of [['Alvo', `Jogador ${record.target}`], ['d20 de ataque', record.attackValues.join(', ')], ['Escolhido / CA', `${record.selected} / ${record.armorClass}`], ['Resultado', record.hit ? 'Acerto' : 'Erro'], ['Crítico natural', record.critical ? 'Sim' : 'Não'], ['Fórmula', record.formula], ['d6 / máximo', record.maximized ? `Componente maximizado ${record.maximizedComponent}, sem sorteio` : record.damageValues.join(', ') || 'Nenhum'], ['Bônus', `+${record.bonus}`], ['Dano nominal', record.nominalDamage], ['Dano aplicado', record.appliedDamage]]) {
    const term = document.createElement('dt'), description = document.createElement('dd'); term.textContent = label; description.textContent = String(value); details.append(term, description);
  }
  entry.append(details); return entry;
}
function paintDice(roll) {
  $('roll-values').replaceChildren();
  let highlighted = false;
  for (const value of roll.values) {
    const die = document.createElement('span');
    die.className = 'die';
    die.textContent = String(value);
    if (!highlighted && value === roll.selected) {
      die.classList.add('chosen');
      die.setAttribute('aria-label', `${value}, d20 escolhido`);
      highlighted = true;
    } else {
      die.setAttribute('aria-label', `${value}, d20`);
    }
    $('roll-values').append(die);
  }
}

let renderedPhase = null, lastActionShown = null, logMatch = null;
function render(view) {
  const state = view.engine, playing = view.phase !== 'menu';
  document.body.dataset.phase = view.phase;
  $('menu-panel').hidden = playing; $('match-panel').hidden = !playing; $('menu-button').hidden = !playing;
  text('phase-title', phases[view.phase]); text('game-message', view.message); $('game-message').classList.toggle('suspended', view.phase === 'suspended');
  $('camera-placeholder').hidden = Boolean(active?.stream && video.readyState >= 2);
  text('resource-status', busy ? 'Conexão e carregamento em andamento…' : `Webcam: ${view.resources.camera ? 'conectada' : 'desconectada'} · Gestos: ${view.resources.model ? 'prontos' : 'indisponíveis'}`);
  $('preserved-initiative').hidden = view.phase !== 'suspended' || view.pendingPair.length === 0;
  text('preserved-initiative', view.pendingPair.length ? `Iniciativa preservada: jogador 1 rolou ${view.pendingPair[0]}. O jogador 2 ainda não rolou.` : '');
  $('resource-indicator').style.color = view.resources.camera && view.resources.model ? '#a2df89' : '#847d8f';
  for (const id of ['identify-camera', 'refresh-cameras', 'connect-resources', 'game-device', 'game-resolution']) $(id).disabled = busy;
  const canConfirm = ['preparation', 'suspended'].includes(view.phase);
  $('confirm-framing').hidden = !canConfirm;
  $('confirm-framing').disabled = busy || !view.resources.camera || !view.resources.model || !view.resources.visible;
  text('confirm-framing', view.phase === 'suspended' ? 'Confirmar enquadramento e retomar' : 'Confirmar enquadramento e iniciar');
  if (renderedPhase !== view.phase) {
    if (canConfirm) $('camera-settings').open = true;
    else if (['gesture', 'initiative', 'result'].includes(view.phase)) $('camera-settings').open = false;
    renderedPhase = view.phase;
  }
  $('initiative-panel').hidden = !state || state.phase !== 'initiative' || view.phase === 'preparation' || view.phase === 'suspended';
  $('result-panel').hidden = state?.phase !== 'finished';
  $('arena-panel').classList.toggle('inactive', !state || state.phase !== 'combat' || view.phase !== 'gesture');
  const attributes = state?.config ?? readConfig();
  for (const id of [1, 2]) {
    const health = state?.players.find(player => player.id === id)?.health ?? (Number.isSafeInteger(attributes.maxHealth) && attributes.maxHealth > 0 ? attributes.maxHealth : DEFAULT_CONFIG.maxHealth);
    const maxHealth = state?.config.maxHealth ?? health;
    text(`health-${id}`, `${health} / ${maxHealth}`); $(`health-bar-${id}`).max = maxHealth; $(`health-bar-${id}`).value = health;
    text(`armor-${id}`, `CA\n${Number.isInteger(attributes.armorClass) && attributes.armorClass > 0 && attributes.armorClass < 20 ? attributes.armorClass : DEFAULT_CONFIG.armorClass}`);
    const isActive = state?.activePlayer === id;
    $(`player-${id}`).classList.toggle('active', isActive);
    $(`player-${id}`).setAttribute('aria-label', `Jogador ${id}, mago ${id === 1 ? 'preto' : 'branco'}${isActive ? ', jogador ativo' : ''}`);
    $(`region-${id}`).classList.toggle('active', isActive && view.phase === 'gesture');
  }
  text('turn-label', !state ? 'Configure vida e armadura' : state.phase === 'finished' ? 'Partida encerrada' : state.phase === 'initiative' ? 'A sorte define quem começa' : `Turno ${String(state.turn).padStart(2, '0')} · vez do jogador ${state.activePlayer}`);
  $('game-progress').value = view.progress;
  text('gesture-instruction', view.phase === 'gesture' ? `Jogador ${state.activePlayer} · ${view.spell ? SPELLS[view.spell]?.name ?? 'Gesto em análise' : 'faça o gesto na sua região'}` : view.phase === 'suspended' ? 'Partida suspensa · confira a webcam e confirme a retomada' : view.phase === 'result' ? 'Duelo concluído' : view.phase === 'nextTurn' ? 'Preparando o próximo turno…' : 'Prepare a webcam e aguarde a iniciativa');
  text('progress-label', view.phase === 'gesture' ? 'Mantenha o gesto para conjurar' : view.phase === 'suspended' ? 'Conjuração suspensa' : view.phase === 'result' ? 'Duelo concluído' : 'A magia aguarda seu gesto');
  for (const spell of Object.keys(SPELLS)) $(`spell-${spell}`).classList.toggle('selected', view.spell === spell && view.phase === 'gesture');
  $('last-roll').hidden = !view.lastRoll; $('roll-empty').hidden = Boolean(view.lastRoll);
  if (!state) { historyRendered = null; initiativeRendered = null; lastActionShown = null; logMatch = null; $('roll-values').replaceChildren(); $('combat-history').replaceChildren(); $('history-empty').hidden = false; return; }
  text('pending-initiative', view.pendingPair.length ? `Jogador 1: ${view.pendingPair[0]} · aguardando jogador 2` : '');
  if (initiativeRendered !== state.initiative.rolls) {
    initiativeRendered = state.initiative.rolls; $('initiative-history').replaceChildren(); $('initiative-recap').replaceChildren();
    for (const pair of state.initiative.rolls) {
      const label = `Jogador 1: ${pair[0]} · Jogador 2: ${pair[1]}${pair[0] === pair[1] ? ' · empate' : ''}`;
      const item = document.createElement('li'); item.textContent = label; $('initiative-history').append(item);
      const recap = document.createElement('p'); recap.textContent = label; $('initiative-recap').append(recap);
    }
  }
  text('initiative-order', state.initiative.order.length ? `Jogador ${state.initiative.order[0]} começa.` : 'Aguardando desempate.');
  $('initiative-recap-details').hidden = state.initiative.rolls.length === 0;
  if (view.lastRoll) {
    const roll = view.lastRoll; text('roll-title', `T${String(roll.turn).padStart(2, '0')} · Jogador ${roll.player} · ${SPELLS[roll.spell].name}`);
    paintDice(roll);

    const record = state.history.find(item => item.turn === roll.turn), plan = roll.plan;
    const pending = plan ? `Escolhido ${plan.selected} contra CA ${plan.armorClass} · ${plan.hit ? (plan.critical ? 'crítico' : 'acerto') : 'erro'} · ${plan.formula} · ${plan.maximized ? `componente maximizado ${plan.maximizedComponent}, sem sorteio de d6` : `d6 preservados: ${roll.damageValues.join(', ') || 'nenhum'} (${roll.damageValues.length}/${plan.rollsRequired})`} · bônus +${plan.bonus}.` : `d20 preservados: ${roll.values.length}/${roll.attackCount}; escolha e acerto ainda pendentes.`;
    text('roll-detail', record ? `${roll.rule} · escolhido ${roll.selected} contra CA ${record.armorClass} · ${damageDetail(record)}` : `${roll.rule} · ${pending} Resolução pendente; resultados preservados.`);
    text('action-summary', record ? `${record.hit ? record.critical ? 'Crítico' : 'Acerto' : 'Erro'} · ${record.appliedDamage} de dano` : 'Ação pendente · dados preservados');
    const panel = $('last-roll').closest('.action-panel'); panel.dataset.outcome = record ? record.hit ? record.critical ? 'critical' : 'hit' : 'miss' : 'pending';
    const actionId = `${roll.match}:${roll.turn}:${Boolean(record)}`;
    if (lastActionShown !== actionId) { lastActionShown = actionId; panel.classList.add('new-action'); }
  }
  if (historyRendered !== state.history || logMatch !== view.context.match) {
    const log = $('combat-history');
    if (logMatch !== view.context.match) { log.replaceChildren(); logMatch = view.context.match; }
    historyRendered = state.history;
    const existingTurns = new Set(Array.from(log.children, entry => Number(entry.dataset.turn)));
    const previousHeight = log.scrollHeight, previousScroll = log.scrollTop;
    // Keep existing details/summary nodes so keyboard focus and expanded items survive new actions.
    for (const record of state.history) if (!existingTurns.has(record.turn)) log.prepend(appendLogRecord(record, new Set()));
    if (previousScroll > 0) log.scrollTop = previousScroll + log.scrollHeight - previousHeight;
    $('history-empty').hidden = state.history.length > 0;
  }
  text('winner-label', state.winner ? `Jogador ${state.winner} venceu!` : '');
}

$('config-form').addEventListener('submit', event => { event.preventDefault(); const { config, validation } = configChanged(); if (!validation.valid) return; controller.start(config); const token = controller.context(); devices(token).catch(error => { if (controller.current(token)) controller.suspend(cameraError(error), { camera: false, model: false }); }); });
for (const key of Object.keys(DEFAULT_CONFIG)) $(key).addEventListener('input', () => { configChanged(); render(controller.view()); });
$('identify-camera').addEventListener('click', identify); $('connect-resources').addEventListener('click', connect);
$('refresh-cameras').addEventListener('click', () => { const token = controller.context(); devices(token).catch(error => { if (controller.current(token)) controller.suspend(cameraError(error)); }); });
$('stop-camera').addEventListener('click', stop);
for (const id of ['game-device', 'game-resolution']) $(id).addEventListener('change', stop);
$('confirm-framing').addEventListener('click', () => controller.confirmFraming());
$('menu-button').addEventListener('click', toMenu); $('result-menu').addEventListener('click', toMenu); $('rematch').addEventListener('click', () => controller.rematch());
$('reduce-motion').addEventListener('change', event => { document.documentElement.dataset.motion = event.target.checked ? 'reduce' : 'system'; });
document.addEventListener('visibilitychange', () => {
  // Cancelar carregamentos em andamento evita prender os controles ao voltar à aba.
  if (document.hidden && busy) { operation++; busy = false; closeResources(); }
  controller.visibility(!document.hidden);
});
const timer = setInterval(() => { const resource = active; tick().catch(error => { if (resource && active === resource) failResource(resource, error.message); }); }, 100);
window.addEventListener('pagehide', () => { clearInterval(timer); operation++; controller.dispose(); closeResources(); });
// Uma página restaurada pelo histórico já encerrou controlador e recursos no pagehide.
window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload(); });
$('last-roll').closest('.action-panel').addEventListener('animationend', event => { if (event.animationName === 'action-glow') event.currentTarget.classList.remove('new-action'); });
configChanged(); render(controller.view()); controller.visibility(!document.hidden);
