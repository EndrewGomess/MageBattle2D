import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

if (Number(process.versions.node.split('.')[0]) < 20) throw new Error('Use Node.js 20 ou superior.');
const root = fileURLToPath(new URL('../', import.meta.url));
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const commit = git(['rev-parse', 'HEAD']);
const branch = git(['branch', '--show-current']);
const dirty = git(['status', '--porcelain=v1', '--untracked-files=all']).length > 0;
const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const createdAt = new Date().toISOString();
const name = `DueloDeMagos-${version}-${commit.slice(0, 7)}${dirty ? '-local' : ''}-${createdAt.replace(/[-:.TZ]/g, '')}`;
const output = resolve(root, 'artifacts');
const stage = join(output, name);
await mkdir(output, { recursive: true });
await mkdir(stage, { recursive: false });
const files = [];
async function include(source, target = source) {
  const bytes = await readFile(join(root, source));
  const destination = join(stage, target);
  await mkdir(resolve(destination, '..'), { recursive: true });
  await writeFile(destination, bytes);
  files.push({ path: target.replaceAll('\\', '/'), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
async function includeTree(relative) {
  for (const item of (await readdir(join(root, relative), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = `${relative}/${item.name}`;
    if (item.isDirectory()) await includeTree(path);
    else if (item.isFile()) await include(path);
    else throw new Error(`Entrada não regular recusada: ${path}`);
  }
}
// Explicit allowlist: no repository history, tests, logs, handoffs or local recordings.
await includeTree('dist');
for (const path of ['scripts/serve.mjs', 'scripts/start.mjs', 'scripts/bootstrap.ps1', 'Jogar.cmd', 'AVISOS.md']) await include(path);
await include('docs/GUIA_USO.md', 'GUIA_RAPIDO.md');
const versionText = `Duelo de Magos ${version}\nOrigem HEAD: ${commit}\nBranch: ${branch}\nAlteracoes locais: ${dirty ? 'sim' : 'nao'}\nGerado em UTC: ${createdAt}\nVeja MANIFESTO.json para os hashes do conteudo efetivamente incluido.\n`;
await writeFile(join(stage, 'VERSAO.txt'), versionText, 'utf8');
files.push({ path: 'VERSAO.txt', bytes: Buffer.byteLength(versionText), sha256: createHash('sha256').update(versionText).digest('hex') });
files.sort((a, b) => a.path.localeCompare(b.path));
const manifest = {
  name: 'Duelo de Magos', version, createdAt,
  source: { head: commit, branch, dirty, note: 'HEAD identifica a base; os hashes abaixo identificam os arquivos locais empacotados, inclusive alteracoes ainda sem commit.' },
  requirements: { windowsLauncher: 'Windows x64/ARM64 com PowerShell 5.1 e internet na primeira inicializacao; Node portatil v24.21.0 validado por SHA-256', manualNode: '>=20', browser: 'desktop', webcam: 1, internetForModels: true },
  integrity: { algorithm: 'SHA-256', scope: 'Todos os arquivos de conteudo, exceto MANIFESTO.json; o hash do ZIP fica no arquivo .sha256 externo.' },
  files
};
await writeFile(join(stage, 'MANIFESTO.json'), JSON.stringify(manifest, null, 2) + '\n');
const archive = join(output, name + '.zip');
// ZIP store (no compression): standard headers, UTF-8 paths, CRC32 and central directory.
// Avoid a dependency on platform archiver modules; this package is well below ZIP32 limits.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
const parts = [], directory = [];
let offset = 0;
const date = new Date(createdAt);
const dosTime = (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | Math.floor(date.getUTCSeconds() / 2);
const dosDate = ((date.getUTCFullYear() - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate();
for (const path of [...files.map(file => file.path), 'MANIFESTO.json']) {
  const bytes = await readFile(join(stage, path));
  const encoded = Buffer.from(name + '/' + path, 'utf8');
  const crc = crc32(bytes);
  if (bytes.length > 0xffffffff || offset > 0xffffffff || encoded.length > 0xffff) throw new Error('Pacote excede os limites ZIP32.');
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6);
  local.writeUInt16LE(dosTime, 10); local.writeUInt16LE(dosDate, 12); local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(bytes.length, 18); local.writeUInt32LE(bytes.length, 22); local.writeUInt16LE(encoded.length, 26);
  parts.push(local, encoded, bytes);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x800, 8);
  central.writeUInt16LE(dosTime, 12); central.writeUInt16LE(dosDate, 14); central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(bytes.length, 20); central.writeUInt32LE(bytes.length, 24); central.writeUInt16LE(encoded.length, 28); central.writeUInt32LE(offset, 42);
  directory.push(central, encoded);
  offset += local.length + encoded.length + bytes.length;
}
const centralBytes = Buffer.concat(directory);
if (files.length + 1 > 0xffff || offset + centralBytes.length > 0xffffffff) throw new Error('Pacote excede os limites ZIP32.');
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length + 1, 8); end.writeUInt16LE(files.length + 1, 10);
end.writeUInt32LE(centralBytes.length, 12); end.writeUInt32LE(offset, 16);
await writeFile(archive, Buffer.concat([...parts, centralBytes, end]), { flag: 'wx' });
const digest = createHash('sha256').update(await readFile(archive)).digest('hex');
await writeFile(archive + '.sha256', `${digest}  ${name}.zip\n`);
console.log(JSON.stringify({ archive, stage, sha256: digest, contentFiles: files.length, source: manifest.source }, null, 2));
