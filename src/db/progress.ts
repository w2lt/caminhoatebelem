/** Marcações opcionais (orações rezadas, encontros realizados, gestos) e intenções. */
import { useLiveQuery } from 'dexie-react-hooks';
import { db, newId, type Intention, type ProgressMark } from './database';

export function markId(kind: ProgressMark['kind'], ref: string) {
  return `${kind}:${ref}`;
}

export async function toggleMark(kind: ProgressMark['kind'], ref: string): Promise<boolean> {
  const id = markId(kind, ref);
  const existing = await db.progress.get(id);
  if (existing) {
    await db.progress.delete(id);
    return false;
  }
  await db.progress.put({ id, kind, ref, at: Date.now() });
  return true;
}

export function useMarks(kind: ProgressMark['kind']): Set<string> | undefined {
  return useLiveQuery(async () => new Set((await db.progress.where('kind').equals(kind).toArray()).map((m) => m.ref)), [kind]);
}

export async function addIntention(text: string, encounter: number): Promise<Intention> {
  const clean = text.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim().slice(0, 500);
  if (clean.length < 2) throw new Error('Escreva a intenção');
  const it: Intention = { id: newId(), text: clean, encounter, createdAt: Date.now() };
  await db.intentions.add(it);
  return it;
}

export async function removeIntention(id: string) {
  await db.intentions.delete(id);
}
