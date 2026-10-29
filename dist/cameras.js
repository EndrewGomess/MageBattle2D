export function cameraError(error) {
  const messages = { NotAllowedError: 'O acesso à câmera não foi autorizado. Permita o acesso no navegador para continuar.', NotFoundError: 'Nenhuma câmera disponível foi encontrada.', NotReadableError: 'A câmera está ocupada ou não pôde ser aberta. Feche outros apps que a estejam usando.', OverconstrainedError: 'O dispositivo ou a configuração solicitada não está disponível.', SecurityError: 'A captura foi bloqueada pelo navegador.', AbortError: 'A abertura da câmera foi interrompida.' };
  return messages[error.name] || error.message || 'Falha ao acessar a câmera.';
}

export class Cameras {
  constructor(onFailure, mediaDevices = globalThis.navigator?.mediaDevices) {
    this.media = mediaDevices; this.onFailure = onFailure; this.streams = new Map(); this.generation = 0; this.opening = false; this.closed = false;
    this.deviceChange = () => this.checkDevices();
    this.media?.addEventListener('devicechange', this.deviceChange);
  }
  async list() {
    if (!this.media) throw new Error('Abra o laboratório em localhost ou HTTPS em um navegador com suporte a câmeras.');
    return (await this.media.enumerateDevices()).filter(d => d.kind === 'videoinput');
  }
  async identify() {
    const generation = this.generation;
    const stream = await this.media.getUserMedia({ video: true, audio: false });
    stream.getTracks().forEach(t => t.stop());
    if (generation !== this.generation) return [];
    return this.list();
  }
  stop() {
    this.generation++; this.opening = false;
    for (const stream of this.streams.values()) for (const track of stream.getTracks()) track.stop();
    this.streams.clear();
  }
  fail(message) { this.stop(); this.onFailure(message); }
  async open(assignments) {
    const ids = assignments.map(a => a.id);
    if (!ids.length || ids.some(id => !id)) throw new Error('Escolha os dispositivos antes de conectar.');
    if (new Set(ids).size !== ids.length) throw new Error('Selecione duas webcams distintas.');
    this.stop(); const generation = this.generation; this.opening = true;
    try {
      for (const assignment of assignments) {
        const stream = await this.media.getUserMedia({ audio: false, video: { deviceId: { exact: assignment.id }, width: { ideal: assignment.width }, height: { ideal: Math.round(assignment.width*9/16) }, frameRate: { ideal: 15 } } });
        if (generation !== this.generation) { stream.getTracks().forEach(t => t.stop()); return null; }
        this.streams.set(assignment.role, stream);
        const track = stream.getVideoTracks()[0];
        if (!track || track.readyState !== 'live') throw new Error('A câmera encerrou o fluxo durante a abertura.');
        for (const event of ['ended', 'mute']) track.addEventListener(event, () => { if (generation === this.generation) this.fail('A câmera foi interrompida. Reconecte a webcam e use Nova seleção para continuar.'); });
      }
      const actual = [...this.streams.values()].map(s => s.getVideoTracks()[0].getSettings().deviceId).filter(Boolean);
      if (assignments.length === 2 && actual.length !== 2) throw new Error('O navegador não informou os identificadores dos dois fluxos; não foi possível verificar dispositivos distintos.');
      if (new Set(actual).size !== actual.length) throw new Error('O navegador retornou o mesmo dispositivo para as duas funções.');
      return this.streams;
    } catch (error) { if (generation === this.generation) this.stop(); throw error; }
    finally { if (generation === this.generation) this.opening = false; }
  }
  async checkDevices() {
    if (this.opening || !this.streams.size) return;
    try {
      const ids = new Set((await this.list()).map(d=>d.deviceId));
      for (const stream of this.streams.values()) {
        const id = stream.getVideoTracks()[0].getSettings().deviceId;
        if (id && !ids.has(id)) { this.fail('Uma câmera foi desconectada. Reconecte e prepare novamente a captura.'); break; }
      }
    } catch { this.fail('Não foi possível verificar os dispositivos conectados.'); }
  }
  dispose() { this.stop(); this.media?.removeEventListener('devicechange', this.deviceChange); }
}
