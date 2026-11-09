/**
 * Lembretes — com honestidade sobre o que a plataforma permite.
 *
 * Uma PWA NÃO consegue agendar notificações confiáveis com o app fechado e sem servidor de push
 * (a API "Notification Triggers" não é padrão; o iPhone só notifica PWAs instaladas e via push).
 * Por isso o app oferece:
 *  1. Exportar os lembretes para o calendário do celular (.ics com alarme) — funciona sempre, offline.
 *  2. Avisos enquanto o app está aberto (notificação do sistema, se permitida).
 */
import { addDaysIso, diffDays, type IsoDate } from '../domain/dates';
import { adventCalendar, novenaDates } from '../domain/liturgical';
import type { AgendaEvent } from '../db/database';
import type { ReminderPrefs } from '../db/settings';
import type { IcsEvent } from './ics';

export interface PlannedReminder {
  id: string;
  kind: keyof ReminderPrefs;
  title: string;
  body: string;
  date: IsoDate;
  time: string;
  /** Para lembretes diários: repete até esta data. */
  dailyUntil?: IsoDate;
  alarmMinutes: number;
}

export interface Capabilities {
  notifications: boolean;
  permission: NotificationPermission | 'unsupported';
  standalone: boolean;
  ios: boolean;
  /** Agendamento offline com o app fechado (praticamente nenhum navegador oferece). */
  scheduledOffline: boolean;
}

export function capabilities(): Capabilities {
  const hasNotif = typeof window !== 'undefined' && 'Notification' in window;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
  const standalone =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true);
  return {
    notifications: hasNotif,
    permission: hasNotif ? Notification.permission : 'unsupported',
    standalone: !!standalone,
    ios,
    scheduledOffline: hasNotif && 'showTrigger' in Notification.prototype,
  };
}

/** Monta a lista de lembretes a partir das preferências, do calendário e da agenda. */
export function plannedReminders(prefs: ReminderPrefs, year: number, events: AgendaEvent[], presepioDate: IsoDate | null, from: IsoDate): PlannedReminder[] {
  const cal = adventCalendar(year);
  const out: PlannedReminder[] = [];
  const start = diffDays(from, cal.domingos[0]) > 0 ? from : cal.domingos[0];

  if (prefs.manha.on && start <= cal.natal) {
    out.push({ id: 'manha', kind: 'manha', title: 'Oração da manhã', body: 'Comece o dia com Deus no Caminho até Belém.', date: start, time: prefs.manha.time, dailyUntil: cal.natal, alarmMinutes: 0 });
  }
  if (prefs.noite.on && start <= cal.natal) {
    out.push({ id: 'noite', kind: 'noite', title: 'Oração da noite', body: 'Hora de agradecer e entregar o dia a Deus.', date: start, time: prefs.noite.time, dailyUntil: cal.natal, alarmMinutes: 0 });
  }
  if (prefs.coroa.on) {
    cal.domingos.forEach((d, i) => {
      if (d >= from) out.push({ id: `coroa-${i + 1}`, kind: 'coroa', title: `Acender a ${i + 1}ª vela da coroa`, body: `${i + 1}º Domingo do Advento: rezem juntos ao acender a vela.`, date: d, time: prefs.coroa.time, alarmMinutes: 0 });
    });
  }
  if (prefs.novena.on) {
    novenaDates(year).forEach((d, i) => {
      if (d >= from) out.push({ id: `novena-${i + 1}`, kind: 'novena', title: `Novena de Natal — ${i + 1}º encontro`, body: 'O encontro de hoje está pronto no app.', date: d, time: prefs.novena.time, alarmMinutes: 0 });
    });
  }
  if (prefs.presepio.on) {
    const d = presepioDate ?? cal.domingos[0];
    if (d >= from) out.push({ id: 'presepio', kind: 'presepio', title: 'Montar o presépio', body: 'Hoje é o dia que você escolheu para montar o presépio.', date: d, time: prefs.presepio.time, alarmMinutes: 0 });
    const vespera = addDaysIso(cal.natal, -1);
    if (vespera >= from) out.push({ id: 'menino-jesus', kind: 'presepio', title: 'Menino Jesus na manjedoura', body: 'Na celebração do Natal, coloque o Menino Jesus no presépio.', date: vespera, time: '22:00', alarmMinutes: 0 });
  }
  for (const e of events) {
    if (e.status !== 'agendado' || e.reminderMinutes == null || e.date < from) continue;
    const isMass = e.category === 'missa-natal';
    if (isMass ? !prefs.missas.on : !prefs.eventos.on) continue;
    out.push({
      id: `evento-${e.id}`,
      kind: isMass ? 'missas' : 'eventos',
      title: e.title,
      body: [e.time, e.location].filter(Boolean).join(' · ') || 'Compromisso da sua agenda',
      date: e.date,
      time: e.time || '08:00',
      alarmMinutes: e.reminderMinutes,
    });
  }
  return out.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function remindersToIcs(list: PlannedReminder[]): IcsEvent[] {
  return list.map((r) => ({
    uid: `lembrete-${r.id}-${r.date}`,
    title: r.title,
    date: r.date,
    time: r.time,
    durationMinutes: 15,
    description: r.body,
    alarmMinutes: r.alarmMinutes,
    dailyUntil: r.dailyUntil,
  }));
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

async function notify(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const reg = await navigator.serviceWorker?.getRegistration?.();
  if (reg) await reg.showNotification(title, { body, icon: '/pwa-192x192.png', badge: '/pwa-192x192.png', tag: title });
  else new Notification(title, { body, icon: '/pwa-192x192.png' });
}

/**
 * Agenda avisos para HOJE enquanto o app estiver aberto. Retorna função para cancelar.
 * Não é um substituto do calendário: se o app for fechado, os avisos não acontecem.
 */
export function scheduleWhileOpen(list: PlannedReminder[], today: IsoDate, now = new Date()): () => void {
  const timers: number[] = [];
  for (const r of list) {
    const occursToday = r.dailyUntil ? r.date <= today && today <= r.dailyUntil : r.date === today;
    if (!occursToday) continue;
    const [hh, mm] = r.time.split(':').map(Number);
    const at = new Date(now);
    at.setHours(hh!, mm! - r.alarmMinutes, 0, 0);
    const delay = at.getTime() - now.getTime();
    if (delay <= 0 || delay > 24 * 60 * 60 * 1000) continue;
    const key = `aviso:${r.id}:${today}`;
    timers.push(
      window.setTimeout(() => {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, '1');
        void notify(r.title, r.body);
      }, delay),
    );
  }
  return () => timers.forEach((t) => clearTimeout(t));
}
