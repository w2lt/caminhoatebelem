// Ferramentas da ativação comercial (rodar no SEU computador, nunca no app).
//
//   node scripts/activation-keys.mjs keys
//       Gera o par de chaves ECDSA P-256 em ./keys (pasta ignorada pelo git).
//       - keys/private.jwk.json → segredo do Worker:  npx wrangler secret put ACTIVATION_PRIVATE_JWK
//       - keys/public.jwk.json  → variável de build:  VITE_ACTIVATION_PUBLIC_JWK
//
//   node scripts/activation-keys.mjs codes 100 [maxDevices]
//       Gera 100 códigos aleatórios:
//       - keys/codes-<data>.csv      → lista para entregar aos compradores (guarde com segurança)
//       - keys/kv-bulk-<data>.json   → para enviar ao KV: npx wrangler kv bulk put --binding LICENSES <arquivo> --remote
//       O KV guarda só o HASH do código; o código em si não fica no servidor.
import { webcrypto as crypto } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';

const [cmd, arg1, arg2] = process.argv.slice(2);
mkdirSync('keys', { recursive: true });

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O e 1/I para evitar confusão

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}

if (cmd === 'keys') {
  if (existsSync('keys/private.jwk.json')) {
    console.error('keys/private.jwk.json já existe. Apague-o manualmente se quiser gerar outro par (isso invalida as ativações atuais).');
    process.exit(1);
  }
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const priv = await crypto.subtle.exportKey('jwk', pair.privateKey);
  const pub = await crypto.subtle.exportKey('jwk', pair.publicKey);
  writeFileSync('keys/private.jwk.json', JSON.stringify(priv));
  writeFileSync('keys/public.jwk.json', JSON.stringify(pub));
  console.log('Chaves geradas em ./keys');
  console.log('VITE_ACTIVATION_PUBLIC_JWK=' + JSON.stringify(pub));
} else if (cmd === 'codes') {
  const n = Math.max(1, Math.min(10000, Number(arg1) || 10));
  const maxDevices = Math.max(1, Math.min(10, Number(arg2) || 3));
  const stamp = new Date().toISOString().slice(0, 10);
  const codes = [];
  const kv = [];
  for (let i = 0; i < n; i++) {
    const code = randomCode();
    const hash = await sha256Hex(code.replace(/[^A-Z0-9]/g, ''));
    codes.push(code);
    kv.push({ key: `code:${hash}`, value: JSON.stringify({ status: 'active', maxDevices, devices: [] }) });
  }
  writeFileSync(`keys/codes-${stamp}.csv`, 'codigo\n' + codes.join('\n') + '\n');
  writeFileSync(`keys/kv-bulk-${stamp}.json`, JSON.stringify(kv, null, 1));
  console.log(`${n} códigos gerados: keys/codes-${stamp}.csv e keys/kv-bulk-${stamp}.json`);
} else {
  console.log('Uso: node scripts/activation-keys.mjs keys | codes <quantidade> [maxAparelhos]');
}
