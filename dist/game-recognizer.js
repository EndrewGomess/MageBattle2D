import { THRESHOLDS } from './config.js';

// Instância exclusiva da partida; o adapter original do laboratório é preservado.
export class GameRecognizer {
  constructor(onFailure = () => {}) { this.onFailure = onFailure; this.worker = null; this.pending = new Map(); this.captures = new Set(); this.sequence = 0; this.generation = 0; this.ready = false; this.busy = false; }
  request(message, transfers = [], timeoutMs = THRESHOLDS.gestureMaxGapMs) {
    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      const timeout = setTimeout(() => { this.pending.delete(id); reject(new Error('O reconhecedor excedeu o tempo de espera. Reconecte para recuperar.')); }, timeoutMs);
      this.pending.set(id, { resolve, reject, timeout });
      try { this.worker.postMessage({ ...message, id }, transfers); }
      catch (error) { clearTimeout(timeout); this.pending.delete(id); reject(error); }
    });
  }
  async load() {
    this.close(); const generation = this.generation;
    const worker = new Worker(new URL('./gesture-worker.js', import.meta.url)); this.worker = worker;
    worker.onmessage = ({ data }) => {
      if (generation !== this.generation) return;
      const pending = this.pending.get(data.id); if (!pending) return;
      clearTimeout(pending.timeout); this.pending.delete(data.id);
      data.error ? pending.reject(new Error(data.error)) : pending.resolve(data);
    };
    const failed = () => { if (generation === this.generation) { this.close(); this.onFailure('Falha no worker de gestos. Reconecte os recursos.'); } };
    worker.onerror = failed; worker.onmessageerror = failed;
    await this.request({ type: 'init' }, [], 60000);
    if (generation === this.generation) this.ready = true;
  }
  async detect(video) {
    if (!this.ready || this.busy) return null;
    this.busy = true; const generation = this.generation; let bitmap = null;
    try {
      bitmap = await this.capture(video, generation);
      if (generation !== this.generation || !this.ready) { bitmap.close(); return null; }
      const response = await this.request({ type: 'recognize', bitmap, timestamp: performance.now() }, [bitmap]);
      return generation === this.generation ? response.result : null;
    } catch (error) { bitmap?.close(); throw error; }
    finally { if (generation === this.generation) this.busy = false; }
  }
  capture(video, generation) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (callback, value) => {
        if (settled) return;
        settled = true; clearTimeout(timeout); this.captures.delete(cancel); callback(value);
      };
      const cancel = () => finish(reject, new Error('Captura do quadro interrompida ou sem resposta. Reconecte para recuperar.'));
      const timeout = setTimeout(cancel, THRESHOLDS.gestureMaxGapMs);
      this.captures.add(cancel);
      Promise.resolve().then(() => settled || generation !== this.generation ? null : createImageBitmap(video)).then(bitmap => {
        if (!bitmap) return;
        if (settled || generation !== this.generation) bitmap.close();
        else finish(resolve, bitmap);
      }, error => finish(reject, error));
    });
  }
  close() {
    this.generation++; this.ready = false; this.busy = false; this.worker?.terminate(); this.worker = null;
    for (const cancel of this.captures) cancel();
    this.captures.clear();
    for (const pending of this.pending.values()) { clearTimeout(pending.timeout); pending.reject(new Error('Reconhecedor encerrado.')); }
    this.pending.clear();
  }
}
