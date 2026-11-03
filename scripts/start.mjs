import { spawn } from 'node:child_process';
import { startServer, serverError } from './serve.mjs';

if (Number(process.versions.node.split('.')[0]) < 20) {
  console.error('Instale Node.js 20 ou superior e abra Jogar.cmd novamente.');
  process.exitCode = 1;
} else {
  try {
    const server = await startServer({ host: '127.0.0.1' });
    const url = `http://127.0.0.1:${server.address().port}/jogo.html`;
    console.log(`Duelo de Magos: ${url}\nMantenha esta janela aberta. Encerre o servidor com Ctrl+C.`);
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
    server.on('error', error => { console.error(serverError(error)); server.close(); process.exitCode = 1; });
    // Launch only after startServer has bound this process's own socket.
    const command = process.platform === 'win32' ? ['rundll32.exe', ['url.dll,FileProtocolHandler', url]]
      : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
    const browser = spawn(command[0], command[1], { stdio: 'ignore', windowsHide: true });
    browser.on('error', () => console.error(`Não foi possível abrir o navegador automaticamente. Abra ${url} manualmente.`));
    browser.on('exit', code => { if (code) console.error(`Abra ${url} manualmente no navegador.`); });
  } catch (error) { console.error(serverError(error)); process.exitCode = 1; }
}
