/** Preferências (chave/valor) com valores padrão e validação. */
import { useLiveQuery } from 'dexie-react-hooks';
import { z } from 'zod';
import { db, type FontSize, type NovenaMode } from './database';

export const reminderPrefs = z.object({
  manha: z.object({ on: z.boolean(), time: z.string() }),
  noite: z.object({ on: z.boolean(), time: z.string() }),
  coroa: z.object({ on: z.boolean(), time: z.string() }),
  novena: z.object({ on: z.boolean(), time: z.string() }),
  presepio: z.object({ on: z.boolean(), time: z.string() }),
  missas: z.object({ on: z.boolean() }),
  eventos: z.object({ on: z.boolean() }),
});
export type ReminderPrefs = z.infer<typeof reminderPrefs>;

export const DEFAULT_REMINDERS: ReminderPrefs = {
  manha: { on: false, time: '07:00' },
  noite: { on: false, time: '21:00' },
  coroa: { on: false, time: '19:00' },
  novena: { on: false, time: '19:30' },
  presepio: { on: false, time: '10:00' },
  missas: { on: false },
  eventos: { on: false },
};

export interface Settings {
  fontSize: FontSize;
  highContrast: boolean;
  onboarded: boolean;
  novenaMode: NovenaMode;
  /** Data escolhida para montar o presépio (padrão: 1º Domingo do Advento). */
  presepioDate: string | null;
  reminders: ReminderPrefs;
  lastBackupAt: number | null;
}

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 'normal',
  highContrast: false,
  onboarded: false,
  novenaMode: 'app',
  presepioDate: null,
  reminders: DEFAULT_REMINDERS,
  lastBackupAt: null,
};

const schemas: { [K in keyof Settings]: z.ZodType<Settings[K]> } = {
  fontSize: z.enum(['normal', 'grande', 'extra']),
  highContrast: z.boolean(),
  onboarded: z.boolean(),
  novenaMode: z.enum(['app', 'circulo']),
  presepioDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  reminders: reminderPrefs,
  lastBackupAt: z.number().nullable(),
};

export async function getSettings(): Promise<Settings> {
  const rows = await db.settings.toArray();
  const out: Settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    const key = row.key as keyof Settings;
    const schema = schemas[key];
    if (!schema) continue;
    const parsed = schema.safeParse(row.value);
    if (parsed.success) (out as unknown as Record<string, unknown>)[key] = parsed.data;
  }
  return out;
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  schemas[key].parse(value);
  await db.settings.put({ key, value });
}

/** Hook reativo: devolve as preferências (ou null enquanto carrega). */
export function useSettings(): Settings | null {
  return useLiveQuery(getSettings, [], null);
}
