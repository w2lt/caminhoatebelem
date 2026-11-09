/**
 * Worker da Cloudflare: serve os arquivos estáticos (dist) e a API de ativação comercial.
 * Só roda para /api/* (ver wrangler.jsonc → run_worker_first). Nenhum dado pessoal chega aqui:
 * apenas o código de ativação e um identificador aleatório do aparelho.
 *
 * Configuração (ver COMMERCIAL_ACTIVATION.md):
 *  - Segredo ACTIVATION_PRIVATE_JWK: chave privada ECDSA P-256 (JSON JWK).
 *  - KV LICENSES: chave "code:<sha256 do código normalizado>" → {"status":"active","maxDevices":3,"devices":[]}
 */

interface KV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

export interface Env {
  ASSETS: { fetch(req: Request): Promise<Response> };
  LICENSES?: KV;
  ACTIVATION_PRIVATE_JWK?: string;
  /** Validade do token em dias (opcional; vazio = sem expiração). */
  ACTIVATION_TOKEN_DAYS?: string;
}

export interface LicenseRecord {
  status: 'active' | 'revoked';
  maxDevices: number;
  devices: string[];
  order?: string;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });

function b64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export async function signToken(privateJwk: JsonWebKey, payload: object): Promise<string> {
  const key = await crypto.subtle.importKey('jwk', privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const p = new TextEncoder().encode(JSON.stringify(payload));
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, p));
  return `${b64url(p)}.${b64url(sig)}`;
}

/** Limite simples por IP: 10 tentativas a cada 10 minutos (usa o próprio KV). */
async function rateLimited(kv: KV, ip: string): Promise<boolean> {
  const key = `rl:${await sha256Hex(ip)}`;
  const n = Number((await kv.get(key)) ?? '0');
  if (n >= 10) return true;
  await kv.put(key, String(n + 1), { expirationTtl: 600 });
  return false;
}

export async function handleActivate(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!env.LICENSES || !env.ACTIVATION_PRIVATE_JWK) return json(503, { error: 'not_configured' });
  const len = Number(req.headers.get('content-length') ?? '0');
  if (len > 1024) return json(413, { error: 'bad_request' });

  let body: { code?: unknown; deviceId?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'bad_request' });
  }
  const code = typeof body.code === 'string' ? normalizeCode(body.code) : '';
  const deviceId = typeof body.deviceId === 'string' ? body.deviceId : '';
  if (code.length < 8 || code.length > 32 || !/^[0-9a-f-]{36}$/i.test(deviceId)) return json(400, { error: 'bad_request' });

  const ip = req.headers.get('cf-connecting-ip') ?? 'desconhecido';
  if (await rateLimited(env.LICENSES, ip)) return json(429, { error: 'rate_limited' });

  const hash = await sha256Hex(code);
  const raw = await env.LICENSES.get(`code:${hash}`);
  if (!raw) return json(404, { error: 'invalid_code' });
  const rec = JSON.parse(raw) as LicenseRecord;
  if (rec.status !== 'active') return json(403, { error: 'revoked' });
  if (!rec.devices.includes(deviceId)) {
    if (rec.devices.length >= rec.maxDevices) return json(409, { error: 'device_limit' });
    rec.devices.push(deviceId);
    await env.LICENSES.put(`code:${hash}`, JSON.stringify(rec));
  }

  const iat = Math.floor(Date.now() / 1000);
  const days = Number(env.ACTIVATION_TOKEN_DAYS ?? '');
  const payload = { v: 1, lic: hash.slice(0, 16), dev: deviceId, iat, ...(days > 0 ? { exp: iat + days * 86400 } : {}) };
  const token = await signToken(JSON.parse(env.ACTIVATION_PRIVATE_JWK) as JsonWebKey, payload);
  return json(200, { token });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/api/activate') return handleActivate(req, env);
    if (url.pathname.startsWith('/api/')) return json(404, { error: 'not_found' });
    return env.ASSETS.fetch(req);
  },
};
