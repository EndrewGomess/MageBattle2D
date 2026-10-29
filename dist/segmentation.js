import { THRESHOLDS } from './config.js';

// O fundo ocupa a maior parte da área de rolagem. A mediana resiste aos
// objetos locais e estima a mudança global de exposição/balanço de branco.
function lightingOffset(frame, reference) {
  const histograms = Array.from({ length: 3 }, () => new Uint32Array(511));
  let samples = 0;
  for (let k = 0; k < frame.length; k += 64) {
    for (let c = 0; c < 3; c++) histograms[c][frame[k+c]-reference[k+c]+255]++;
    samples++;
  }
  return histograms.map(histogram => {
    let sum = 0;
    for (let i = 0; i < histogram.length; i++) {
      sum += histogram[i];
      if (sum >= Math.ceil(samples/2)) return i-255;
    }
    return 0;
  });
}

export function segment(frame, background, previous, width, height, threshold = THRESHOLDS.difference) {
  const n = width * height;
  if (!background || frame.length !== n * 4 || background.length !== frame.length) throw new Error('Calibre o fundo nesta resolução.');
  const raw = new Uint8Array(n), clean = new Uint8Array(n), visited = new Uint8Array(n);
  const backgroundOffset = lightingOffset(frame, background);
  const motionOffset = previous ? lightingOffset(frame, previous) : [0,0,0];
  const [bgR,bgG,bgB] = backgroundOffset, [motionR,motionG,motionB] = motionOffset;
  const needsCalibration = backgroundOffset.some(offset => Math.abs(offset) > THRESHOLDS.maxLightingShift);
  let motion = 0, changed = 0;
  for (let i = 0; i < n; i++) {
    const k = i * 4;
    const delta = Math.max(Math.abs(frame[k]-background[k]-bgR), Math.abs(frame[k+1]-background[k+1]-bgG), Math.abs(frame[k+2]-background[k+2]-bgB));
    raw[i] = delta > threshold ? 1 : 0; changed += raw[i];
    if (previous && Math.max(Math.abs(frame[k]-previous[k]-motionR), Math.abs(frame[k+1]-previous[k+1]-motionG), Math.abs(frame[k+2]-previous[k+2]-motionB)) > threshold) motion++;
  }
  // Maioria local remove ruído isolado. Não identifica a classe do objeto.
  for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
    let sum = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) sum += raw[(y+dy)*width+x+dx];
    clean[y*width+x] = sum >= THRESHOLDS.maskNeighbours ? 1 : 0;
  }
  const objects = [], queue = new Int32Array(n);
  let obstructed = needsCalibration || changed / n > 0.3;
  for (let start = 0; start < n; start++) {
    if (!clean[start] || visited[start]) continue;
    let head = 0, tail = 1, pixels = 0, minX = width, minY = height, maxX = 0, maxY = 0;
    queue[0] = start; visited[start] = 1;
    while (head < tail) {
      const p = queue[head++], x = p % width, y = Math.floor(p/width);
      pixels++; minX = Math.min(minX,x); maxX = Math.max(maxX,x); minY = Math.min(minY,y); maxY = Math.max(maxY,y);
      const neighbours = [x > 0 ? p-1 : -1, x < width-1 ? p+1 : -1, y > 0 ? p-width : -1, y < height-1 ? p+width : -1];
      for (const q of neighbours) if (q >= 0 && clean[q] && !visited[q]) { visited[q] = 1; queue[tail++] = q; }
    }
    if (pixels < THRESHOLDS.minBlobPixels) continue;
    const box = { x: minX, y: minY, width: maxX-minX+1, height: maxY-minY+1, pixels };
    if (box.width < THRESHOLDS.minBlobSide || box.height < THRESHOLDS.minBlobSide || pixels/(box.width*box.height) < THRESHOLDS.minBlobFill) continue;
    if (pixels > n*0.13 || minX <= 2 || minY <= 2 || maxX >= width-3 || maxY >= height-3) obstructed = true;
    objects.push(box);
  }
  return { objects: objects.sort((a,b)=>a.x-b.x), count: objects.length, moving: !previous || motion / n > THRESHOLDS.motion, motion: motion / n, obstructed, changed: changed / n, lightingOffset: backgroundOffset, needsCalibration };
}
