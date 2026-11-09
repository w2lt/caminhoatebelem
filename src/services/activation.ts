/**
 * Camada de licenciamento comercial — separada dos dados pessoais (tabela `license`, fora do backup).
 *
 * Fluxo (ver COMMERCIAL_ACTIVATION.md):
 *  1. O comprador recebe um código de ativação da plataforma de vendas.
 *  2. O app envia { code, deviceId } para POST /api/activate (Worker na Cloudflare).
 *  3. O servidor valida o código (KV) e devolve um token ASSINADO com chave privada ECDSA P-256.
 *  4. O app verifica a assinatura com a CHAVE PÚBLICA (embutida no build) e guarda o token.
 *  5. Nos próximos usos a verificação é local: funciona offline.
 *
 * Limites honestos: verificação no cliente inibe o compartilhamento casual, mas não é proteção
 * absoluta contra cópia (o código do app pode ser alterado por quem tem conhecimento técnico).
 * Não há senha universal nem segredo no frontend: só a chave PÚBLICA.
 */
import { db } from '../db/database';

export type LicenseStatus =
  | { state: 'not-required' }
  | { state: 'active'; activatedAt: number }
  | { state: 'missing' }
  | { state: 'invalid'; reason: string }
  | { state: 'misconfigured'; reason: string };

export interface ActivationConfig {
  required: boolean;
  publicJwk: JsonWebKey | null;
  endpoint: string;
}

export function readConfig(env: Record<string, string | undefined> = import.meta.env as Record<string, string | undefined>): ActivationConfig {
  let publicJwk: JsonWebKey | null = null;
  try {
    publicJwk = env.VITE_ACTIVATION_PUBLIC_JWK ? (JSON.parse(env.VITE_ACTIVATION_PUBLIC_JWK) as JsonWebKey) : null;
  } catch {
    publicJwk = null;
  }
  return {
    required: env.VITE_ACTIVATION_MODE === 'required',
    publicJwk,
    endpoint: env.VITE_ACTIVATION_ENDPOINT || '/api/activate',
  };
}

export interface TokenPayload {
  v: 1;
  /** Primeiros caracteres do hash do código (nunca o código em si). */
  lic: string;
  dev: string;
  iat: number;
  exp?: number;
}

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function verifyToken(token: string, publicJwk: JsonWebKey, deviceId: string, now = Date.now()): Promise<TokenPayload> {
  const [p, s] = token.split('.');
  if (!p || !s) throw new Error('Token malformado');
  const key = await crypto.subtle.importKey('jwk', publicJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64urlToBytes(s), b64urlToBytes(p));
  if (!ok) throw new Error('Assinatura inválida');
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p))) as TokenPayload;
  if (payload.v !== 1) throw new Error('Versão de token desconhecida');
  if (payload.dev !== deviceId) throw new Error('Token de outro aparelho');
  if (payload.exp && payload.exp * 1000 < now) throw new Error('Licença expirada');
  return payload;
}

/** Identificador aleatório do aparelho (sem dados pessoais), criado uma vez. */
export async function deviceId(): Promise<string> {
  const row = await db.settings.get('deviceId');
  if (typeof row?.value === 'string') return row.value;
  const id = crypto.randomUUID();
  await db.settings.put({ key: 'deviceId', value: id });
  return id;
}

export async function licenseStatus(cfg = readConfig()): Promise<LicenseStatus> {
  if (!cfg.required) return { state: 'not-required' };
  if (!cfg.publicJwk) return { state: 'misconfigured', reason: 'Chave pública de ativação não configurada no build.' };
  const rec = await db.license.get('license');
  if (!rec) return { state: 'missing' };
  try {
    await verifyToken(rec.token, cfg.publicJwk, await deviceId());
    return { state: 'active', activatedAt: rec.activatedAt };
  } catch (err) {
    return { state: 'invalid', reason: (err as Error).message };
  }
}

export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export class ActivationError extends Error {}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: 'Código não encontrado. Confira as letras e números (sem espaços) no e-mail da compra.',
  revoked: 'Este código foi cancelado (por exemplo, após reembolso). Fale com o suporte.',
  device_limit: 'Este código já foi ativado no número máximo de aparelhos. Fale com o suporte.',
  rate_limited: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
  not_configured: 'A ativação ainda não está disponível no servidor. Fale com o suporte.',
  bad_request: 'Código inválido.',
};

export async function activate(code: string, cfg = readConfig(), fetchImpl: typeof fetch = fetch): Promise<void> {
  const clean = normalizeCode(code);
  if (clean.length < 8 || clean.length > 32) throw new ActivationError('O código deve ter entre 8 e 32 letras e números.');
  if (!cfg.publicJwk) throw new ActivationError('Ativação não configurada neste app. Fale com o suporte.');
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ActivationError('Sem internet. A ativação precisa de conexão apenas desta vez.');
  }
  const dev = await deviceId();
  let res: Response;
  try {
    res = await fetchImpl(cfg.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: clean, deviceId: dev }),
    });
  } catch {
    throw new ActivationError('Não foi possível falar com o servidor. Verifique a internet e tente de novo.');
  }
  const body = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
  if (!res.ok || !body.token) throw new ActivationError(ERROR_MESSAGES[body.error ?? ''] ?? 'Não foi possível ativar agora. Tente novamente mais tarde.');
  await verifyToken(body.token, cfg.publicJwk, dev); // nunca aceita token sem assinatura válida
  await db.license.put({ id: 'license', token: body.token, activatedAt: Date.now(), deviceId: dev });
}
