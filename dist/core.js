import { THRESHOLDS } from './config.js';

export const SPELLS = Object.freeze({
  Pointing_Up: { name: 'Mísseis Mágicos', dice: 2, gesture: 'Indicador' },
  Victory: { name: 'Raio de Fogo', dice: 1, gesture: 'Sinal de V' },
  Open_Palm: { name: 'Bola de Fogo', dice: 2, gesture: 'Mão aberta' }
});

// Convert once from the unmirrored inference frame to the mirrored preview coordinates.
export function previewX(x) { return 1 - x; }

export function activeGesture(result, player, threshold = null) {
  const candidates = [];
  for (let i = 0; i < (result.landmarks?.length || 0); i++) {
    const hand = result.landmarks[i];
    const xs = hand.map(p => previewX(p.x));
    const lo = Math.min(...xs), hi = Math.max(...xs);
    const edge = 0.5, gap = THRESHOLDS.deadZone / 2;
    if (!(player === 1 ? hi < edge - gap : lo > edge + gap)) continue;
    const category = result.gestures?.[i]?.[0];
    const minimum = threshold ?? THRESHOLDS.gestureScores[category?.categoryName] ?? THRESHOLDS.gestureScore;
    candidates.push(category && SPELLS[category.categoryName] && category.score >= minimum ? category : null);
  }
  return candidates.length === 1 && candidates[0] ? candidates[0] : null;
}

export class GestureGate {
  constructor(holdMs = THRESHOLDS.gestureHoldMs) { this.holdMs = holdMs; this.reset(); }
  reset() { this.name = null; this.since = null; this.last = null; this.confirmed = null; }
  observe(category, now) {
    if (this.confirmed) return { confirmed: this.confirmed, progress: 1, fresh: false };
    if (!category || !SPELLS[category.categoryName]) { this.reset(); return { progress: 0 }; }
    if (this.name !== category.categoryName || this.last === null || now - this.last > THRESHOLDS.gestureMaxGapMs) {
      this.name = category.categoryName; this.since = now;
    }
    this.last = now;
    const progress = Math.min(1, (now - this.since) / this.holdMs);
    if (progress === 1) { this.confirmed = this.name; return { confirmed: this.name, progress, fresh: true }; }
    return { progress };
  }
}

// Valida observações de objetos, nunca transforma OCR experimental em resultado do jogo.
export class CaptureGate {
  constructor() { this.revision = 0; this.cancel(); }
  cancel() { this.revision++; this.phase = 'idle'; this.expected = 0; this.since = null; this.last = null; this.signature = null; }
  begin(expected) {
    if (![1, 2].includes(expected)) throw new Error('A quantidade deve ser 1 ou 2.');
    this.cancel(); this.expected = expected; this.phase = 'empty';
  }
  observe({ count, moving = false, obstructed = false, boxes = [] }, now) {
    if (['idle', 'consumed'].includes(this.phase)) return this.phase;
    if (this.last !== null && now - this.last > THRESHOLDS.observationGapMs) { this.since = null; this.signature = null; this.revision++; }
    this.last = now;
    if (this.phase === 'empty') {
      if (count !== 0 || moving || obstructed) this.since = null;
      else if (this.since === null) this.since = now;
      else if (now - this.since >= THRESHOLDS.emptyMs) { this.phase = 'armed'; this.since = null; }
      return this.phase;
    }
    const distinctBoxes = new Set(boxes.map(b=>`${b.x}:${b.y}:${b.width}:${b.height}`));
    if (count !== this.expected || boxes.length !== this.expected || distinctBoxes.size !== this.expected || moving || obstructed) {
      this.phase = 'armed'; this.since = null; this.signature = null; this.revision++; return this.phase;
    }
    const signature = boxes.map(b => [Math.round(b.x / 12), Math.round(b.y / 12), Math.round(b.width / 12), Math.round(b.height / 12)].join(':')).sort().join('|');
    if (this.signature !== signature || this.since === null) {
      this.signature = signature; this.since = now; this.phase = 'armed'; this.revision++;
    } else if (now - this.since >= THRESHOLDS.stableMs) this.phase = 'stable';
    return this.phase;
  }
  token() { return this.phase === 'stable' ? this.revision : null; }
  consume(token) {
    if (token === null || this.phase !== 'stable' || token !== this.revision) return false;
    this.phase = 'consumed'; this.revision++; return true;
  }
}

export function parseD20(text) {
  const normalized = String(text ?? '').trim();
  if (!/^(?:[1-9]|1[0-9]|20)$/.test(normalized)) return null;
  return Number(normalized);
}

export function chooseOcrCandidate(results, threshold = THRESHOLDS.ocrConfidence) {
  const valid = results.filter(r => Number.isInteger(r.value) && r.value >= 1 && r.value <= 20 && Number.isFinite(r.confidence) && r.confidence >= threshold);
  const distinct = new Set(valid.map(r=>r.value));
  return { best: distinct.size === 1 ? [...valid].sort((a,b)=>b.confidence-a.confidence)[0] : null, ambiguous: distinct.size > 1 };
}

export function summarize(records) {
  const comparable = records.filter(r => r.expected !== null);
  const accepted = comparable.filter(r => r.predicted !== null);
  const correct = accepted.filter(r => JSON.stringify([...r.expected].sort((a,b)=>a-b)) === JSON.stringify([...r.predicted].sort((a,b)=>a-b)));
  return { attempts: comparable.length, rejected: comparable.length - accepted.length, correct: correct.length, incorrect: accepted.length - correct.length, accuracyAllAttempts: comparable.length ? correct.length / comparable.length : null, precisionAccepted: accepted.length ? correct.length / accepted.length : null };
}
