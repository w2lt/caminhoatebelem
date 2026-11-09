/** Regras de negócio da Agenda do Advento (CRUD, validação, ordenação, próximo evento). */
import { z } from 'zod';
import { db, newId, EVENT_CATEGORIES, MASS_TYPES, type AgendaEvent, type EventCategory } from './database';

const cleanText = (max: number) =>
  z
    .string()
    .max(max, `Use no máximo ${max} caracteres`)
    // remove caracteres de controle (exceto quebras de linha) — o React já escapa HTML na exibição
    .transform((s) => s.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim());

export const eventInput = z.object({
  title: cleanText(120).refine((s) => s.length >= 2, 'Informe um título'),
  category: z.enum(Object.keys(EVENT_CATEGORIES) as [EventCategory, ...EventCategory[]]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Escolha a data'),
  time: z.string().regex(/^(\d{2}:\d{2})?$/, 'Horário inválido'),
  location: cleanText(160),
  address: cleanText(200),
  community: cleanText(120),
  responsible: cleanText(120),
  description: cleanText(1000),
  reminderMinutes: z.number().int().min(0).max(10080).nullable(),
  status: z.enum(['agendado', 'realizado', 'cancelado']),
  massType: z.enum(Object.keys(MASS_TYPES) as [keyof typeof MASS_TYPES, ...(keyof typeof MASS_TYPES)[]]).optional(),
});
export type EventInput = z.input<typeof eventInput>;

export const EMPTY_EVENT: EventInput = {
  title: '',
  category: 'missa',
  date: '',
  time: '',
  location: '',
  address: '',
  community: '',
  responsible: '',
  description: '',
  reminderMinutes: null,
  status: 'agendado',
};

export type FieldErrors = Partial<Record<keyof EventInput, string>>;

export function validateEvent(input: EventInput): { ok: true; data: z.output<typeof eventInput> } | { ok: false; errors: FieldErrors } {
  const r = eventInput.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  const errors: FieldErrors = {};
  for (const issue of r.error.issues) {
    const k = issue.path[0] as keyof EventInput;
    if (!errors[k]) errors[k] = issue.message;
  }
  return { ok: false, errors };
}

export async function createEvent(input: EventInput): Promise<AgendaEvent> {
  const v = validateEvent(input);
  if (!v.ok) throw new Error(Object.values(v.errors)[0]);
  const now = Date.now();
  const ev: AgendaEvent = { ...v.data, id: newId(), createdAt: now, updatedAt: now };
  await db.events.add(ev);
  return ev;
}

export async function updateEvent(id: string, input: EventInput): Promise<void> {
  const v = validateEvent(input);
  if (!v.ok) throw new Error(Object.values(v.errors)[0]);
  const current = await db.events.get(id);
  if (!current) throw new Error('Atividade não encontrada');
  await db.events.put({ ...current, ...v.data, massType: v.data.massType, updatedAt: Date.now() });
}

export async function deleteEvent(id: string): Promise<void> {
  await db.events.delete(id);
}

/** Momento de início (ms) no horário local; sem horário = início do dia. */
export function eventStart(e: Pick<AgendaEvent, 'date' | 'time'>): number {
  const [y, m, d] = e.date.split('-').map(Number);
  const [hh, mm] = (e.time || '00:00').split(':').map(Number);
  return new Date(y!, m! - 1, d!, hh ?? 0, mm ?? 0).getTime();
}

export function sortChronological<T extends Pick<AgendaEvent, 'date' | 'time'>>(list: T[]): T[] {
  return [...list].sort((a, b) => eventStart(a) - eventStart(b));
}

/**
 * Próximo compromisso: o primeiro agendado que ainda não terminou.
 * Eventos sem horário continuam "próximos" durante todo o dia.
 */
export function nextEvent<T extends AgendaEvent>(list: T[], now = Date.now()): T | undefined {
  return sortChronological(list).find((e) => {
    if (e.status !== 'agendado') return false;
    const end = e.time ? eventStart(e) + 60 * 60 * 1000 : eventStart(e) + 24 * 60 * 60 * 1000;
    return end > now;
  });
}

export function splitUpcomingPast<T extends AgendaEvent>(list: T[], now = Date.now()) {
  const sorted = sortChronological(list);
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  return {
    upcoming: sorted.filter((e) => eventStart(e) >= startToday.getTime()),
    past: sorted.filter((e) => eventStart(e) < startToday.getTime()).reverse(),
  };
}
