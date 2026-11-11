/**
 * Banco local (IndexedDB via Dexie). Nada daqui é enviado a servidores.
 *
 * Versões do banco — REGRA: nunca altere uma versão já publicada; crie a próxima com `.upgrade()`.
 *  v1: settings, events, progress, intentions, circle, pdfs, songs
 *  v2: índice composto [category+date] na agenda e status padrão "agendado" nos eventos antigos
 *  (licença comercial fica em tabela própria, `license`, fora do backup de dados pessoais)
 */
import Dexie, { type EntityTable } from 'dexie';

export type FontSize = 'normal' | 'grande' | 'extra';
export type NovenaMode = 'app' | 'circulo';

export const EVENT_CATEGORIES = {
  missa: 'Missa',
  'missa-natal': 'Missa de Natal',
  confissao: 'Confissão',
  novena: 'Novena',
  circulo: 'Círculo Bíblico',
  comunidade: 'Encontro comunitário',
  solidaria: 'Ação solidária',
  familia: 'Atividade familiar',
  presepio: 'Presépio',
  coroa: 'Coroa do Advento',
  outros: 'Outros',
} as const;
export type EventCategory = keyof typeof EVENT_CATEGORIES;

export const MASS_TYPES = {
  vigilia: 'Missa da Vigília de Natal (24/12, à tarde)',
  noite: 'Missa da Noite de Natal',
  aurora: 'Missa da Aurora',
  dia: 'Missa do Dia de Natal',
  outra: 'Outra celebração',
} as const;
export type MassType = keyof typeof MASS_TYPES;

export type EventStatus = 'agendado' | 'realizado' | 'cancelado';

export interface AgendaEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // AAAA-MM-DD
  time: string; // HH:mm ou ''
  location: string;
  address: string;
  community: string;
  responsible: string;
  description: string;
  /** Minutos de antecedência do lembrete; null = sem lembrete. */
  reminderMinutes: number | null;
  status: EventStatus;
  massType?: MassType;
  createdAt: number;
  updatedAt: number;
}

export interface ProgressMark {
  /** "<tipo>:<referência>", ex.: "manha:2026-12-01", "novena:3", "familia:2026-12-05". */
  id: string;
  kind: 'manha' | 'noite' | 'novena' | 'familia' | 'circulo' | 'gesto';
  ref: string;
  at: number;
}

export interface Intention {
  id: string;
  text: string;
  /** Encontro da novena relacionado (1..9) ou 0 para intenção geral. */
  encounter: number;
  createdAt: number;
}

export interface CircleMeeting {
  number: number; // 1..9
  date: string;
  time: string;
  /** Tema do encontro (ausente em registros antigos). */
  theme?: string;
  address: string;
  family: string;
  notes: string;
  done: boolean;
}

export interface Circle {
  id: 'principal';
  name: string;
  community: string;
  notes: string;
  meetings: CircleMeeting[];
  pdfId?: string;
  updatedAt: number;
}

export interface StoredPdf {
  id: string;
  name: string;
  size: number;
  pages: number;
  blob: Blob;
  addedAt: number;
}

export interface SavedSong {
  id: string;
  addedAt: number;
}

export interface Setting {
  key: string;
  value: unknown;
}

export interface LicenseRecord {
  id: 'license';
  token: string;
  activatedAt: number;
  /** Identificador anônimo do aparelho (aleatório), sem dados pessoais. */
  deviceId: string;
}

export class AppDB extends Dexie {
  settings!: EntityTable<Setting, 'key'>;
  events!: EntityTable<AgendaEvent, 'id'>;
  progress!: EntityTable<ProgressMark, 'id'>;
  intentions!: EntityTable<Intention, 'id'>;
  circle!: EntityTable<Circle, 'id'>;
  pdfs!: EntityTable<StoredPdf, 'id'>;
  songs!: EntityTable<SavedSong, 'id'>;
  license!: EntityTable<LicenseRecord, 'id'>;

  constructor(name = 'caminho-ate-belem') {
    super(name);
    this.version(1).stores({
      settings: 'key',
      events: 'id, date, category',
      progress: 'id, kind, at',
      intentions: 'id, encounter, createdAt',
      circle: 'id',
      pdfs: 'id, addedAt',
      songs: 'id, addedAt',
    });
    this.version(2)
      .stores({
        events: 'id, date, category, [category+date], status',
        license: 'id',
      })
      .upgrade(async (tx) => {
        await tx
          .table('events')
          .toCollection()
          .modify((e: Partial<AgendaEvent>) => {
            if (!e.status) e.status = 'agendado';
            if (e.address === undefined) e.address = '';
          });
      });
  }
}

export const db = new AppDB();

/** Tabelas que fazem parte do backup de dados pessoais (licença comercial fica de fora). */
export const BACKUP_TABLES = ['settings', 'events', 'progress', 'intentions', 'circle', 'pdfs', 'songs'] as const;
export type BackupTable = (typeof BACKUP_TABLES)[number];

export function newId(): string {
  return crypto.randomUUID();
}

/** Converte erros do IndexedDB em mensagens claras (inclui falta de espaço). */
export function friendlyDbError(err: unknown): string {
  const name = (err as { name?: string; inner?: { name?: string } })?.name;
  const inner = (err as { inner?: { name?: string } })?.inner?.name;
  if (name === 'QuotaExceededError' || inner === 'QuotaExceededError') {
    return 'Não há espaço suficiente no celular para salvar. Apague arquivos PDF antigos ou libere espaço no aparelho e tente de novo.';
  }
  if (name === 'InvalidStateError' || name === 'DatabaseClosedError') {
    return 'O armazenamento do navegador não está disponível (talvez esteja em modo anônimo). Abra o app normalmente para salvar seus dados.';
  }
  return 'Não foi possível salvar agora. Tente novamente.';
}

/** Pede ao navegador armazenamento persistente (reduz o risco de limpeza automática). */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* navegador sem suporte */
  }
  return false;
}

export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  try {
    const e = await navigator.storage?.estimate?.();
    if (e && typeof e.usage === 'number' && typeof e.quota === 'number') return { usage: e.usage, quota: e.quota };
  } catch {
    /* sem suporte */
  }
  return null;
}
