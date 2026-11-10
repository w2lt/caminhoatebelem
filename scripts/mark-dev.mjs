// Marca o build (dist/) como ambiente de desenvolvimento antes do deploy:dev:
// pede aos buscadores para não indexar o endereço app-dev.
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../dist/_headers', import.meta.url);
const linhas = readFileSync(file, 'utf8').split('\n');
if (!linhas.some((l) => l.includes('X-Robots-Tag'))) {
  const i = linhas.findIndex((l) => l.trim() === '/*');
  if (i < 0) throw new Error('dist/_headers sem o bloco /*');
  linhas.splice(i + 1, 0, '  X-Robots-Tag: noindex, nofollow');
  writeFileSync(file, linhas.join('\n'));
}
console.log('dist/_headers marcado como desenvolvimento (noindex).');
