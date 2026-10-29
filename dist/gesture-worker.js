let recognizer = null;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      const { DEPENDENCIES } = await import('./config.js');
      const { FilesetResolver, GestureRecognizer } = await import(DEPENDENCIES.visionModule);
      const files = await FilesetResolver.forVisionTasks(DEPENDENCIES.visionWasm);
      recognizer = await GestureRecognizer.createFromOptions(files, { baseOptions: { modelAssetPath: DEPENDENCIES.gestureModel, delegate: 'CPU' }, runningMode: 'VIDEO', numHands: 4, minHandDetectionConfidence: 0.6, minHandPresenceConfidence: 0.6, minTrackingConfidence: 0.6 });
      self.postMessage({ id: data.id, ready: true });
    } else if (data.type === 'recognize') {
      if (!recognizer) throw new Error('Carregue o reconhecedor antes do ensaio.');
      const result = recognizer.recognizeForVideo(data.bitmap, data.timestamp);
      self.postMessage({ id: data.id, result });
    }
  } catch (error) { self.postMessage({ id: data.id, error: error.message }); }
  finally { data.bitmap?.close(); }
};
