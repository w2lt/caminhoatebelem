/** Novena dos Círculos Bíblicos: cadastro do grupo e dos nove encontros. */
import { z } from 'zod';
import { db, type Circle, type CircleMeeting } from './database';

const text = (max: number) => z.string().max(max).transform((s) => s.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim());

export const meetingSchema = z.object({
  number: z.number().int().min(1).max(9),
  date: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Data inválida'),
  time: z.string().regex(/^(\d{2}:\d{2})?$/, 'Horário inválido'),
  address: text(200),
  family: text(120),
  notes: text(500),
  done: z.boolean(),
});

export const circleSchema = z.object({
  id: z.literal('principal'),
  name: text(120),
  community: text(120),
  notes: text(1000),
  meetings: z.array(meetingSchema).length(9),
  pdfId: z.string().optional(),
  updatedAt: z.number(),
});

export function emptyMeetings(year: number): CircleMeeting[] {
  return Array.from({ length: 9 }, (_, i) => ({
    number: i + 1,
    date: `${year}-12-${String(16 + i).padStart(2, '0')}`,
    time: '',
    address: '',
    family: '',
    notes: '',
    done: false,
  }));
}

export function emptyCircle(year: number): Circle {
  return { id: 'principal', name: '', community: '', notes: '', meetings: emptyMeetings(year), updatedAt: Date.now() };
}

export async function saveCircle(c: Circle): Promise<void> {
  const parsed = circleSchema.parse({ ...c, updatedAt: Date.now() });
  await db.circle.put(parsed as Circle);
}

export async function toggleMeetingDone(number: number): Promise<void> {
  const c = await db.circle.get('principal');
  if (!c) return;
  c.meetings = c.meetings.map((m) => (m.number === number ? { ...m, done: !m.done } : m));
  await saveCircle(c);
}
