/**
 * Backup e restauração dos dados pessoais (agenda, progresso, intenções, Círculo, PDFs, cânticos, preferências).
 * O arquivo fica com o usuário: o app não envia o backup para lugar nenhum.
 * Restauração: valida formato, versão, checksum e cada registro antes de gravar (tudo ou nada).
 */
import { z } from 'zod';
import { readBytes } from '../lib/bytes';
import { db, BACKUP_TABLES, type BackupTable } from '../db/database';
import { circleSchema } from '../db/circle';
import { eventInput } from '../db/events';

export const BACKUP_FORMAT = 'caminho-ate-belem-backup';
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 120 * 1024 * 1024;

export class BackupError extends Error {}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await readBytes(blob));
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

function base64ToBlob(b64: string, type: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Ordena chaves para que o checksum seja estável. */
function stable(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v,
  );
}

export async function createBackup(): Promise<{ json: string; filename: string }> {
  const data: Record<string, unknown[]> = {};
  for (const t of BACKUP_TABLES) {
    const rows = await db.table(t).toArray();
    if (t === 'pdfs') {
      data[t] = await Promise.all(rows.map(async (r) => ({ ...r, blob: await blobToBase64(r.blob as Blob) })));
    } else data[t] = rows;
  }
  const checksum = await sha256(stable(data));
  const payload = { format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt: new Date().toISOString(), checksum, data };
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return {
    json: JSON.stringify(payload),
    filename: `caminho-ate-belem-backup-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`,
  };
}

const eventRow = eventInput.extend({ id: z.string().min(1), createdAt: z.number(), updatedAt: z.number() });
const rowSchemas: Record<BackupTable, z.ZodTypeAny> = {
  settings: z.object({ key: z.string().min(1).max(60), value: z.unknown() }),
  events: eventRow,
  progress: z.object({ id: z.string().max(80), kind: z.enum(['manha', 'noite', 'novena', 'familia', 'circulo', 'gesto']), ref: z.string().max(40), at: z.number() }),
  intentions: z.object({ id: z.string(), text: z.string().max(500), encounter: z.number().int().min(0).max(9), createdAt: z.number() }),
  circle: circleSchema,
  pdfs: z.object({ id: z.string(), name: z.string().max(100), size: z.number().max(25 * 1024 * 1024), pages: z.number(), blob: z.string(), addedAt: z.number() }),
  songs: z.object({ id: z.string().max(60), addedAt: z.number() }),
};

const envelope = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.number().int(),
  createdAt: z.string(),
  checksum: z.string().length(64),
  data: z.record(z.string(), z.array(z.unknown())),
});

export interface RestoreSummary {
  events: number;
  intentions: number;
  pdfs: number;
  progress: number;
}

export async function parseBackup(text: string): Promise<{ data: Record<BackupTable, unknown[]>; summary: RestoreSummary; createdAt: string }> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupError('Este arquivo não é um backup do Caminho até Belém (formato inválido).');
  }
  const env = envelope.safeParse(raw);
  if (!env.success) throw new BackupError('Este arquivo não é um backup do Caminho até Belém.');
  if (env.data.version > BACKUP_VERSION) throw new BackupError('Este backup foi feito numa versão mais nova do app. Atualize o app e tente de novo.');
  if ((await sha256(stable(env.data.data))) !== env.data.checksum) {
    throw new BackupError('O backup está incompleto ou foi alterado. Use outra cópia do arquivo.');
  }
  const data = {} as Record<BackupTable, unknown[]>;
  for (const t of BACKUP_TABLES) {
    const rows = env.data.data[t] ?? [];
    const parsed: unknown[] = [];
    for (const row of rows) {
      const r = rowSchemas[t].safeParse(row);
      if (!r.success) throw new BackupError(`Há um registro inválido no backup (${t}). Nada foi alterado.`);
      parsed.push(r.data);
    }
    data[t] = parsed;
  }
  return {
    data,
    createdAt: env.data.createdAt,
    summary: { events: data.events.length, intentions: data.intentions.length, pdfs: data.pdfs.length, progress: data.progress.length },
  };
}

/** Substitui os dados pessoais pelos do backup, numa única transação (tudo ou nada). */
export async function restoreBackup(text: string): Promise<RestoreSummary> {
  if (text.length > MAX_BACKUP_BYTES) throw new BackupError('Arquivo grande demais para ser um backup.');
  const { data, summary } = await parseBackup(text);
  await db.transaction('rw', BACKUP_TABLES.map((t) => db.table(t)), async () => {
    for (const t of BACKUP_TABLES) {
      await db.table(t).clear();
      const rows = t === 'pdfs' ? (data.pdfs as { blob: string }[]).map((r) => ({ ...r, blob: base64ToBlob(r.blob, 'application/pdf') })) : data[t];
      if (rows.length) await db.table(t).bulkPut(rows);
    }
  });
  return summary;
}
