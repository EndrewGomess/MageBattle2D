import { Cameras, cameraError } from './cameras.js';
import { GestureGate, SPELLS, activeGesture } from './core.js';
import { GestureVision } from './vision.js';
import { rollForGesture } from './dice.js';
import { DEPENDENCIES, THRESHOLDS } from './config.js';

const $ = id => document.getElementById(id), video = $('players-video');
const gate = new GestureGate(), gestures = new GestureVision();
const state = { epoch: 0, armed: false, everConnected: false, loading: false, lastFrame: -1, lastSeen: 0, observation: null, lastRoll: null, rolls: [], records: [], events: [], sessions: [], session: null };
const cameras = new Cameras(message => { suspend(message); detach(); notify(message, true); log('camera-failure', message); });
function notify(message, error = false) { $('message').textContent = message; $('message').classList.toggle('error', error); }
function log(type, detail) {
  const event = { at: new Date().toISOString(), type, detail }; state.events.push(event);
  const li = document.createElement('li'); li.textContent = `${new Date(event.at).toLocaleTimeString('pt-BR')} · ${detail}`; $('events').prepend(li);
}
function action(id, handler) { $(id).addEventListener('click', async () => { try { await handler(); } catch (error) { notify(cameraError(error), true); log('error', error.message); } }); }
function live() {
  const track = cameras.streams.get('players')?.getVideoTracks()[0];
  return track?.readyState === 'live' && !track.muted && video.readyState >= 2;
}
function resetPending() { if (!gate.confirmed) gate.reset(); $('gesture-progress').value = gate.confirmed ? 1 : 0; state.observation = null; }
function suspend(reason) { state.epoch++; state.armed = false; resetPending(); $('gesture-status').textContent = `${reason} Resultado preservado; use Nova seleção após recuperar a câmera.`; }
function detach() {
  if (state.session) { state.session.endedAt = new Date().toISOString(); state.session = null; }
  video.srcObject = null; $('players-placeholder').hidden = false; $('players-settings').textContent = 'Desconectada'; state.lastFrame = -1; state.lastSeen = 0;
}
function stop(reason = 'Câmera encerrada.') { cameras.stop(); suspend(reason); detach(); }
async function refreshDevices(devices = null) {
  devices ??= await cameras.list(); const select = $('players-device'), previous = select.value; select.replaceChildren();
  devices.forEach((device, index) => { const option = document.createElement('option'); option.value = device.deviceId; option.textContent = device.label || `Câmera ${index + 1}`; select.append(option); });
  if (!devices.length) { const option = document.createElement('option'); option.value = ''; option.textContent = 'Nenhuma câmera visível'; select.append(option); }
  else if (devices.some(d => d.deviceId === previous)) select.value = previous;
  $('camera-count').textContent = `${devices.length} câmera(s) disponível(is); apenas uma será usada`; return devices;
}
action('identify', async () => {
  stop('Permissão/identificação em andamento.'); $('identify').disabled = true;
  try { await refreshDevices(await cameras.identify()); notify('Selecione uma webcam para os gestos dos dois jogadores.'); } finally { $('identify').disabled = false; }
});
action('refresh', async () => { await refreshDevices(); notify('Lista atualizada.'); });
action('connect', async () => {
  if (state.loading) throw new Error('Aguarde o carregamento do reconhecedor antes de conectar.');
  const assignment = { role: 'players', id: $('players-device').value, width: Number($('players-resolution').value) };
  stop('Reconexão em andamento.'); const epoch = state.epoch;
  const lockedControls = ['connect', 'identify', 'refresh', 'players-device', 'players-resolution', 'load-models', 'active-player', 'reset-gesture'];
  lockedControls.forEach(id => { $(id).disabled = true; });
  try {
    const streams = await cameras.open([assignment]); if (!streams || epoch !== state.epoch) return;
    video.srcObject = streams.get('players'); await video.play(); if (epoch !== state.epoch) return;
    const s = streams.get('players').getVideoTracks()[0].getSettings();
    $('players-settings').textContent = `${s.width}×${s.height} · ${Math.round(s.frameRate || 0)} fps`; $('players-placeholder').hidden = true;
    video.parentElement.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`; state.lastFrame = -1; state.lastSeen = performance.now();
    state.session = { openedAt: new Date().toISOString(), settings: { width: s.width, height: s.height, frameRate: s.frameRate }, newFramesObserved: 0 }; state.sessions.push(state.session);
    state.armed = !state.everConnected; state.everConnected = true;
    $('gesture-status').textContent = state.armed ? 'Faça o gesto na região do jogador ativo.' : 'Câmera reconectada. Resultado preservado; clique em Nova seleção.';
    log('camera-open', 'Uma webcam aberta para os dois jogadores.'); notify('Confira o enquadramento e carregue o reconhecedor de gestos.');
  } catch (error) { if (epoch === state.epoch) stop('Não foi possível abrir a câmera.'); throw error; } finally { lockedControls.forEach(id => { $(id).disabled = false; }); }
});
action('stop', () => { stop(); notify('Câmera encerrada. Seleção, rolagem e registros preservados.'); log('camera-stop', 'Webcam encerrada.'); });
for (const id of ['players-device', 'players-resolution']) $(id).addEventListener('change', () => { stop('Configuração alterada.'); notify('Conecte a webcam e use Nova seleção para retomar.'); });
action('load-models', async () => {
  if (state.loading) return; state.loading = true; $('load-models').disabled = true; state.epoch++; resetPending();
  try { if (!gestures.ready) await gestures.load(); $('model-status').textContent = 'Gestos: pronto'; notify('Reconhecedor de gestos carregado. Não há OCR de dados.'); log('model', 'Reconhecedor de gestos inicializado.'); }
  catch (error) { suspend('Reconhecedor indisponível.'); $('model-status').textContent = 'Gestos: indisponível'; throw error; }
  finally { state.loading = false; $('load-models').disabled = false; }
});
$('active-player').addEventListener('change', () => { suspend('Jogador ativo alterado.'); log('active-player', `Região ativa: jogador ${$('active-player').value}. Nova seleção necessária.`); });
action('reset-gesture', () => {
  if (!live() || !gestures.ready || document.hidden) throw new Error('Conecte a webcam e carregue o reconhecedor antes de uma nova seleção.');
  state.epoch++; gate.reset(); state.observation = null; state.armed = true; state.lastFrame = video.currentTime; state.lastSeen = performance.now();
  $('gesture-progress').value = 0; $('gesture-status').textContent = 'Faça o gesto na região ativa. A última rolagem permanece identificada abaixo.'; log('selection-start', `Nova seleção para o jogador ${$('active-player').value}.`);
});
async function updateGesture() {
  if (!live() || document.hidden) return; const now = performance.now();
  if (video.currentTime === state.lastFrame) { if (state.armed && now - state.lastSeen > THRESHOLDS.gestureMaxGapMs) suspend('Vídeo sem novos quadros.'); return; }
  if (state.armed && state.lastFrame !== -1 && now - state.lastSeen > THRESHOLDS.gestureMaxGapMs) { state.epoch++; resetPending(); }
  state.lastFrame = video.currentTime; state.lastSeen = now; if (state.session) state.session.newFramesObserved++;
  if (!state.armed || !gestures.ready || gestures.busy || gate.confirmed) return;
  const epoch = state.epoch, player = Number($('active-player').value), frameTime = video.currentTime;
  try {
    const result = await gestures.detect(video);
    if (!result || epoch !== state.epoch || !state.armed || !live() || document.hidden || player !== Number($('active-player').value)) return;
    if (performance.now() - now > THRESHOLDS.gestureMaxGapMs || (video.currentTime === frameTime && performance.now() - state.lastSeen > THRESHOLDS.gestureMaxGapMs)) { state.epoch++; resetPending(); return; }
    const classScores = (result.gestures || []).flatMap((classes, handIndex) => classes.map(item => ({ handIndex, className: item.categoryName, score: item.score })));
    const category = activeGesture(result, player); state.observation = { at: new Date().toISOString(), player, previewMirrored: true, recognizedGesture: category?.categoryName ?? null, score: category?.score ?? null, classScores };
    const selection = gate.observe(category, now); $('gesture-progress').value = selection.progress || 0;
    $('gesture-status').textContent = selection.confirmed ? `${SPELLS[selection.confirmed].name} confirmada; rolagem única abaixo.` : category ? `${SPELLS[category.categoryName].name} · mantenha o gesto` : 'Faça um único gesto na região do jogador ativo.';
    if (selection.fresh) {
      state.armed = false; const rolled = { ...rollForGesture(selection.confirmed), player, at: new Date().toISOString(), selectionId: state.rolls.length + 1, source: 'software-rng', diagnosticOnly: true }; state.lastRoll = rolled; state.rolls.push(rolled);
      $('dice-values').textContent = rolled.values.join(' e '); $('dice-selected').textContent = String(rolled.selected); $('dice-spell').textContent = `Jogador ${player} · ${SPELLS[rolled.gesture].name}`;
      $('dice-detail').textContent = `${rolled.rule} · seleção ${rolled.selectionId}. Use Nova seleção para outra tentativa. Nenhum dano ou turno de combate é aplicado.`;
      log('virtual-roll', `${$('dice-spell').textContent}: [${rolled.values.join(', ')}], escolhido ${rolled.selected}.`);
    }
  } catch (error) { if (epoch !== state.epoch) return; suspend('Falha no reconhecimento.'); notify(error.message, true); log('gesture-error', error.message); }
}
action('record', () => {
  state.records.push({ at: new Date().toISOString(), case: $('case').value, observedGestureByOperator: $('observed-gesture').value, operatorAssessment: $('assessment').value, notes: $('notes').value.trim(), activePlayer: Number($('active-player').value), softwareObservation: state.observation ? { ...state.observation } : null, lastSoftwareRoll: state.lastRoll ? { ...state.lastRoll, values: [...state.lastRoll.values] } : null, cameraLive: Boolean(live()), diagnosticOnly: true }); renderRecords(); notify('Observação registrada. Exporte antes de fechar a página.');
});
function renderRecords() {
  $('records').replaceChildren();
  for (const r of [...state.records].reverse()) {
    const row = document.createElement('tr');
    for (const value of [new Date(r.at).toLocaleTimeString('pt-BR'), r.case, r.observedGestureByOperator, r.softwareObservation?.recognizedGesture ?? 'Sem reconhecimento atual', r.lastSoftwareRoll ? `Seleção ${r.lastSoftwareRoll.selectionId}: ${r.lastSoftwareRoll.values.join(', ')} → ${r.lastSoftwareRoll.selected}` : 'Sem rolagem', r.operatorAssessment]) { const td = document.createElement('td'); td.textContent = value; row.append(td); } $('records').append(row);
  }
  $('metrics').textContent = `${state.records.length} observação(ões) do operador · ${state.rolls.length} rolagem(ns). Não constitui medição automática da precisão dos gestos.`;
}
action('export', () => {
  const report = { schemaVersion: 3, generatedAt: new Date().toISOString(), delivery: 2, purpose: 'Laboratório: gestos por webcam e d20 virtuais; sem motor de combate', environment: { userAgent: navigator.userAgent, secureContext: isSecureContext }, dependencies: DEPENDENCIES, gestureThresholds: { scoresByClass: THRESHOLDS.gestureScores, legacyOverride: THRESHOLDS.gestureScore, holdMs: THRESHOLDS.gestureHoldMs, maxGapMs: THRESHOLDS.gestureMaxGapMs, deadZone: THRESHOLDS.deadZone }, preview: { mirrored: true, player1: 'left', player2: 'right', inferenceXToPreviewX: '1 - x' }, cameraSessions: state.sessions, diceMethod: 'Math.random; floor(rng()*20)+1; uma chamada independente por dado', physicalGestureAccuracy: 'Não calculada; avaliações do operador não aprovam automaticamente o reconhecimento', rolls: state.rolls, records: state.records, events: state.events };
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `ensaio-duelo-${new Date().toISOString().replaceAll(':', '-')}.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Relatório exportado localmente, sem imagens ou identificadores dos dispositivos.');
});
const timer = setInterval(() => { updateGesture(); }, 100);
document.addEventListener('visibilitychange', () => { if (document.hidden) { suspend('Aba oculta.'); log('visibility', 'Seleção pendente suspensa; resultado anterior preservado.'); } });
window.addEventListener('pagehide', () => { clearInterval(timer); state.epoch++; cameras.dispose(); gestures.close(); });
window.addEventListener('unhandledrejection', event => { suspend('Falha de processamento.'); notify(event.reason?.message || String(event.reason), true); });
log('session', 'Laboratório iniciado: uma webcam, dados virtuais, nenhum ensaio físico aprovado automaticamente.');
if (!isSecureContext || !navigator.mediaDevices) notify('Abra em localhost ou HTTPS para usar a câmera.', true);
