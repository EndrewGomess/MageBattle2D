import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative, extname, sep } from 'node:path';

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.png': 'image/png', '.ttf': 'font/ttf' };

// Resolves only after this server owns the listening socket; callers must not probe another service.
export async function startServer({ port = Number(process.env.PORT || 4173), host = process.env.HOST || '127.0.0.1' } = {}) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT deve ser um inteiro de 1 a 65535.');
  const root = await realpath(fileURLToPath(new URL('../dist/', import.meta.url)));
  const server = createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = await realpath(resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname)));
      const rel = relative(root, file);
      if (rel === '..' || rel.startsWith('..' + sep) || (await stat(file)).isDirectory()) { res.writeHead(403).end(); return; }
      const bytes = await readFile(file);
      res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Arquivo não encontrado.'); }
  });
  await new Promise((resolve, reject) => {
    const failed = error => { server.off('listening', listening); reject(error); };
    const listening = () => { server.off('error', failed); resolve(); };
    server.once('error', failed);
    server.once('listening', listening);
    server.listen(port, host);
  });
  return server;
}

export function serverError(error) {
  return error.code === 'EADDRINUSE' ? 'A porta está ocupada. Feche apenas o servidor que você iniciou ou defina PORT para usar outra porta.' : error.message;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const server = await startServer();
    const address = server.address();
    console.log(`Laboratório disponível em ${address.address}:${address.port}`);
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
  } catch (error) { console.error(serverError(error)); process.exitCode = 1; }
}
