import { describe, expect, it, vi } from 'vitest';
import worker, { handleActivate, sha256Hex, type Env } from './index';
import { activate, licenseStatus, verifyToken, readConfig, ActivationError } from '../src/services/activation';
import { db } from '../src/db/database';

class MemoryKV {
  map = new Map<string, string>();
  async get(k: string) {
    return this.map.get(k) ?? null;
  }
  async put(k: string, v: string) {
    this.map.set(k, v);
  }
}

async function setup(maxDevices = 2) {
  const pair = (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])) as CryptoKeyPair;
  const priv = await crypto.subtle.exportKey('jwk', pair.privateKey);
  const pub = await crypto.subtle.exportKey('jwk', pair.publicKey);
  const kv = new MemoryKV();
  await kv.put(`code:${await sha256Hex('ABCD2345EFGH')}`, JSON.stringify({ status: 'active', maxDevices, devices: [] }));
  await kv.put(`code:${await sha256Hex('REVOGADO1234')}`, JSON.stringify({ status: 'revoked', maxDevices, devices: [] }));
  const env: Env = { ASSETS: { fetch: async () => new Response('app') }, LICENSES: kv, ACTIVATION_PRIVATE_JWK: JSON.stringify(priv) };
  const cfg = { required: true, publicJwk: pub, endpoint: 'https://app.test/api/activate' };
  const fetchImpl = (async (url: string, init: RequestInit) => handleActivate(new Request(url, init), env)) as unknown as typeof fetch;
  return { env, kv, cfg, pub, fetchImpl };
}

const post = (body: unknown) => new Request('https://app.test/api/activate', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
const DEV = '11111111-2222-3333-4444-555555555555';

describe('API de ativação (Worker)', () => {
  it('sem configuração responde 503 — nunca ativa "de mentira"', async () => {
    const res = await handleActivate(post({ code: 'ABCD2345EFGH', deviceId: DEV }), { ASSETS: { fetch: async () => new Response() } });
    expect(res.status).toBe(503);
  });

  it('código válido gera token assinado e verificável só para aquele aparelho', async () => {
    const { env, pub } = await setup();
    const res = await handleActivate(post({ code: 'abcd-2345-efgh', deviceId: DEV }), env);
    expect(res.status).toBe(200);
    const { token } = (await res.json()) as { token: string };
    await expect(verifyToken(token, pub, DEV)).resolves.toMatchObject({ v: 1, dev: DEV });
    await expect(verifyToken(token, pub, '99999999-2222-3333-4444-555555555555')).rejects.toThrow('outro aparelho');
    // token adulterado
    const [p, s] = token.split('.');
    await expect(verifyToken(`${p}x.${s}`, pub, DEV)).rejects.toThrow();
  });

  it('código inexistente, revogado, limite de aparelhos e entrada inválida', async () => {
    const { env } = await setup(1);
    expect((await handleActivate(post({ code: 'NAOEXISTE123', deviceId: DEV }), env)).status).toBe(404);
    expect((await handleActivate(post({ code: 'REVOGADO1234', deviceId: DEV }), env)).status).toBe(403);
    expect((await handleActivate(post({ code: 'ABCD2345EFGH', deviceId: DEV }), env)).status).toBe(200);
    expect((await handleActivate(post({ code: 'ABCD2345EFGH', deviceId: DEV }), env)).status).toBe(200); // mesmo aparelho
    expect((await handleActivate(post({ code: 'ABCD2345EFGH', deviceId: '99999999-2222-3333-4444-555555555555' }), env)).status).toBe(409);
    expect((await handleActivate(post({ code: 'x', deviceId: 'y' }), env)).status).toBe(400);
  });

  it('limita tentativas por IP', async () => {
    const { env } = await setup();
    let last = 0;
    for (let i = 0; i < 11; i++) last = (await handleActivate(post({ code: 'NAOEXISTE123', deviceId: DEV }), env)).status;
    expect(last).toBe(429);
  });

  it('só /api/* passa pelo Worker; o resto vai para os arquivos estáticos', async () => {
    const { env } = await setup();
    expect(await (await worker.fetch(new Request('https://app.test/agenda'), env)).text()).toBe('app');
    expect((await worker.fetch(new Request('https://app.test/api/outra'), env)).status).toBe(404);
  });
});

describe('ativação no app', () => {
  it('fluxo completo: ativa, guarda token e funciona offline depois', async () => {
    const { cfg, fetchImpl } = await setup();
    expect(await licenseStatus(cfg)).toEqual({ state: 'missing' });
    await activate('ABCD-2345-EFGH', cfg, fetchImpl);
    expect((await licenseStatus(cfg)).state).toBe('active');
  });

  it('mensagens claras de erro', async () => {
    const { cfg, fetchImpl } = await setup();
    await expect(activate('curto', cfg, fetchImpl)).rejects.toThrow(ActivationError);
    await expect(activate('NAOEXISTE123', cfg, fetchImpl)).rejects.toThrow('Código não encontrado');
    const offline = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(activate('ABCD2345EFGH', cfg, offline as unknown as typeof fetch)).rejects.toThrow('servidor');
  });

  it('token forjado gravado no banco é rejeitado', async () => {
    const { cfg } = await setup();
    await db.license.put({ id: 'license', token: 'eyJ2IjoxfQ.AAAA', activatedAt: 1, deviceId: 'x' });
    expect((await licenseStatus(cfg)).state).toBe('invalid');
  });

  it('configuração padrão: ativação não exigida', () => {
    expect(readConfig({}).required).toBe(false);
    expect(readConfig({ VITE_ACTIVATION_MODE: 'required', VITE_ACTIVATION_PUBLIC_JWK: 'lixo' }).publicJwk).toBeNull();
  });
});
