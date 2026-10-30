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
  $('damage-preview').textContent = validation.valid ? `Danos no acerto: Mísseis ${BigInt(config.baseDamage) / 2n} · Raio ${config.baseDamage} · Bola ${BigInt(config.baseDamage) * 2n}.` : 'Informe valores inteiros válidos para visualizar os danos.';
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
function render(view) {
  const state = view.engine, playing = view.phase !== 'menu';
  $('menu-panel').hidden = playing; $('match-panel').hidden = !playing;
  text('phase-title', phases[view.phase]); text('game-message', view.message); $('game-message').classList.toggle('suspended', view.phase === 'suspended');
  $('camera-placeholder').hidden = Boolean(active?.stream && video.readyState >= 2);
  text('resource-status', busy ? 'Conexão e carregamento em andamento…' : `Webcam: ${view.resources.camera ? 'conectada' : 'desconectada'} · Gestos: ${view.resources.model ? 'prontos' : 'indisponíveis'}`);
  for (const id of ['identify-camera', 'refresh-cameras', 'connect-resources', 'game-device', 'game-resolution']) $(id).disabled = busy;
  const canConfirm = ['preparation', 'suspended'].includes(view.phase);
  $('confirm-framing').hidden = !canConfirm;
  $('confirm-framing').disabled = busy || !view.resources.camera || !view.resources.model || !view.resources.visible;
  text('confirm-framing', view.phase === 'suspended' ? 'Confirmar enquadramento e retomar' : 'Confirmar enquadramento e iniciar');
  $('initiative-panel').hidden = !state || (state.initiative.rolls.length === 0 && view.phase === 'preparation');
  $('arena-panel').hidden = !state || state.phase === 'initiative'; $('history-panel').hidden = !state || state.phase === 'initiative';
  $('result-panel').hidden = state?.phase !== 'finished';
  if (!state) { historyRendered = null; initiativeRendered = null; return; }
  text('pending-initiative', view.pendingPair.length ? `Par em andamento: jogador 1 = ${view.pendingPair[0]}; jogador 2 ainda não rolou.` : '');
  if (initiativeRendered !== state.initiative.rolls) {
    initiativeRendered = state.initiative.rolls; $('initiative-history').replaceChildren();
    for (const pair of state.initiative.rolls) { const item = document.createElement('li'); item.textContent = `Jogador 1: ${pair[0]} · Jogador 2: ${pair[1]}${pair[0] === pair[1] ? ' · empate' : ''}`; $('initiative-history').append(item); }
  }
  text('initiative-order', state.initiative.order.length ? `Ordem definida: jogador ${state.initiative.order[0]}, depois jogador ${state.initiative.order[1]}.` : 'Aguardando desempate.');
  for (const player of state.players) {
    text(`health-${player.id}`, `Vida: ${player.health} / ${state.config.maxHealth}`);
    $(`health-bar-${player.id}`).max = state.config.maxHealth; $(`health-bar-${player.id}`).value = player.health;
    text(`armor-${player.id}`, `CA ${state.config.armorClass}`);
    $(`player-${player.id}`).classList.toggle('active', state.activePlayer === player.id);
    $(`region-${player.id}`).classList.toggle('active', state.activePlayer === player.id && view.phase === 'gesture');
  }
  text('turn-label', state.phase === 'finished' ? 'Partida encerrada.' : `Turno ${state.turn} · jogador ${state.activePlayer ?? '—'}`);
  text('damage-missiles', `Dano no acerto: ${BigInt(state.config.baseDamage) / 2n}`); text('damage-ray', `Dano no acerto: ${state.config.baseDamage}`); text('damage-fireball', `Dano no acerto: ${BigInt(state.config.baseDamage) * 2n}`);
  $('game-progress').value = view.progress;
  for (const spell of Object.keys(SPELLS)) $(`spell-${spell}`).classList.toggle('selected', view.spell === spell);
  $('last-roll').hidden = !view.lastRoll;
  if (view.lastRoll) {
    const roll = view.lastRoll; text('roll-title', `Turno ${roll.turn} · jogador ${roll.player} · ${SPELLS[roll.spell].name}`);
    $('roll-values').replaceChildren(); let highlighted = false;
    for (const value of roll.values) { const die = document.createElement('span'); die.className = 'die'; die.textContent = String(value); if (!highlighted && value === roll.selected) { die.classList.add('chosen'); die.setAttribute('aria-label', `${value}, escolhido`); highlighted = true; } $('roll-values').append(die); }
    const record = state.history.find(item => item.turn === roll.turn);
    text('roll-detail', record ? `${roll.rule} · escolhido ${roll.selected} contra CA ${record.armorClass} · ${record.hit ? 'acerto' : 'erro'} · dano aplicado ${record.damage}.` : `${roll.rule} · escolhido ${roll.selected} · resolução pendente, resultado preservado.`);
  }
  if (historyRendered !== state.history) {
    historyRendered = state.history; $('combat-history').replaceChildren();
    for (const record of state.history) { const row = document.createElement('tr'); for (const content of [record.turn, `Jogador ${record.attacker}`, record.spellName, record.values.join(', '), record.selected, record.armorClass, record.hit ? 'Acerto' : 'Erro', record.damage]) { const cell = document.createElement('td'); cell.textContent = String(content); row.append(cell); } $('combat-history').append(row); }
    $('history-empty').hidden = state.history.length > 0;
  }
  text('winner-label', state.winner ? `Jogador ${state.winner} venceu!` : '');
}

$('config-form').addEventListener('submit', event => { event.preventDefault(); const { config, validation } = configChanged(); if (!validation.valid) return; controller.start(config); const token = controller.context(); devices(token).catch(error => { if (controller.current(token)) controller.suspend(cameraError(error), { camera: false, model: false }); }); });
for (const key of Object.keys(DEFAULT_CONFIG)) $(key).addEventListener('input', configChanged);
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
configChanged(); render(controller.view()); controller.visibility(!document.hidden);
