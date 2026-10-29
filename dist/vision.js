
export class GestureVision {
  constructor() { this.worker = null; this.requests = new Map(); this.sequence = 0; this.busy = false; this.ready = false; }
  send(message, transfers = []) {
    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      const timeout = setTimeout(() => { this.requests.delete(id); reject(new Error('O reconhecimento excedeu o tempo de espera. Recarregue os modelos.')); }, 60000);
      this.requests.set(id, { resolve, reject, timeout });
      this.worker.postMessage({ ...message, id }, transfers);
    });
  }
  async load() {
    this.close();
    // O carregador WASM desta versão usa importScripts: precisa de worker clássico.
    this.worker = new Worker(new URL('./gesture-worker.js', import.meta.url));
    this.worker.onmessage = ({ data }) => {
      const pending = this.requests.get(data.id); if (!pending) return;
      clearTimeout(pending.timeout); this.requests.delete(data.id);
      data.error ? pending.reject(new Error(data.error)) : pending.resolve(data);
    };
    this.worker.onerror = () => { this.close(); };
    await this.send({ type: 'init' }); this.ready = true;
  }
  async detect(source) {
    if (!this.ready || this.busy) return null;
    this.busy = true;
    try {
      const bitmap = await createImageBitmap(source);
      const response = await this.send({ type: 'recognize', bitmap, timestamp: performance.now() }, [bitmap]);
      return response.result;
    } finally { this.busy = false; }
  }
  close() {
    this.ready = false; this.worker?.terminate(); this.worker = null;
    for (const request of this.requests.values()) { clearTimeout(request.timeout); request.reject(new Error('O reconhecedor foi encerrado.')); }
    this.requests.clear();
  }
}


