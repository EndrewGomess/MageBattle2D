export const DEPENDENCIES = Object.freeze({
  visionVersion: '0.10.21',
  visionModule: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs',
  visionWasm: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm',
  gestureModel: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task'
});

// Pontos de partida do ensaio, sem precisão física demonstrada.
export const THRESHOLDS = Object.freeze({
  gestureScore: 0.75, gestureScores: Object.freeze({ Open_Palm: 0.60, Pointing_Up: 0.75, Victory: 0.75 }), gestureHoldMs: 1000, gestureMaxGapMs: 500, deadZone: 0.06,
  // Parâmetros legados da investigação física, sem uso no fluxo ativo.
  emptyMs: 600, stableMs: 900, observationGapMs: 550,
  difference: 55, motion: 0.018, minBlobPixels: 300, minBlobSide: 14,
  minBlobFill: 0.35, maskNeighbours: 6, maxLightingShift: 60,
  ocrConfidence: 80
});
