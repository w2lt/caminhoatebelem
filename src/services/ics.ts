/**
 * Exportação de eventos no formato iCalendar (.ics, RFC 5545) para o calendário do celular.
 * É a alternativa confiável aos lembretes: o calendário nativo avisa mesmo com o app fechado.
 * Horários "flutuantes" (sem fuso): o evento acontece no horário local de quem importa.
 */

export interface IcsEvent {
  uid: string;
  title: string;
  date: string; // AAAA-MM-DD
  time?: string; // HH:mm
  durationMinutes?: number;
  location?: string;
  description?: string;
  /** Minutos antes para o alarme; null/undefined = sem alarme. */
  alarmMinutes?: number | null;
  /** Repetição diária até a data (inclusive), ex.: oração da manhã durante o Advento. */
  dailyUntil?: string;
}

/** Escapa texto conforme RFC 5545 (barra invertida, ponto e vírgula, vírgula e quebras). */
export function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Quebra linhas com mais de 75 octetos (continuação começa com espaço). */
export function foldLine(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (size + n > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += ch;
    size += n;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const compactDate = (d: string) => d.replace(/-/g, '');

function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const dt = new Date(y!, m! - 1, d!, hh!, mm! + minutes);
  const p = (n: number) => String(n).padStart(2, '0');
  return { date: `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`, time: `${p(dt.getHours())}:${p(dt.getMinutes())}` };
}

function stamp(now: Date) {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function buildIcs(events: IcsEvent[], now = new Date()): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Caminho ate Belem//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const e of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e.uid}@caminhoatebelem`);
    lines.push(`DTSTAMP:${stamp(now)}`);
    if (e.time) {
      const end = addMinutes(e.date, e.time, e.durationMinutes ?? 60);
      lines.push(`DTSTART:${compactDate(e.date)}T${e.time.replace(':', '')}00`);
      lines.push(`DTEND:${compactDate(end.date)}T${end.time.replace(':', '')}00`);
    } else {
      const next = addMinutes(e.date, '00:00', 24 * 60).date;
      lines.push(`DTSTART;VALUE=DATE:${compactDate(e.date)}`);
      lines.push(`DTEND;VALUE=DATE:${compactDate(next)}`);
    }
    if (e.dailyUntil) lines.push(`RRULE:FREQ=DAILY;UNTIL=${compactDate(e.dailyUntil)}T235959`);
    lines.push(`SUMMARY:${escapeIcs(e.title)}`);
    if (e.location) lines.push(`LOCATION:${escapeIcs(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeIcs(e.description)}`);
    if (e.alarmMinutes != null) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeIcs(e.title)}`, `TRIGGER:-PT${e.alarmMinutes}M`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

export function icsBlob(events: IcsEvent[]): Blob {
  return new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' });
}
