/** Datas "de calendário" (sem fuso) no formato AAAA-MM-DD, sempre no horário local do aparelho. */
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type IsoDate = string;

export function toIso(d: Date): IsoDate {
  return format(d, 'yyyy-MM-dd');
}

export function fromIso(iso: IsoDate): Date {
  return parseISO(iso);
}

export function addDaysIso(iso: IsoDate, n: number): IsoDate {
  return toIso(addDays(fromIso(iso), n));
}

export function diffDays(a: IsoDate, b: IsoDate): number {
  return differenceInCalendarDays(fromIso(a), fromIso(b));
}

/** "domingo, 29 de novembro de 2026" */
export function longDate(iso: IsoDate): string {
  const s = format(fromIso(iso), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "29 de novembro" */
export function shortDate(iso: IsoDate): string {
  return format(fromIso(iso), "d 'de' MMMM", { locale: ptBR });
}

/** "dom., 29/11" */
export function tinyDate(iso: IsoDate): string {
  const s = format(fromIso(iso), 'EEE, dd/MM', { locale: ptBR });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function weekdayName(iso: IsoDate): string {
  return format(fromIso(iso), 'EEEE', { locale: ptBR });
}

/**
 * "Hoje" do app. Em desenvolvimento e nos testes é possível simular uma data com
 * ?hoje=AAAA-MM-DD na URL (útil para revisar o conteúdo de qualquer dia do Advento).
 */
export function todayIso(now: Date = new Date()): IsoDate {
  if (typeof window !== 'undefined') {
    const fake = new URLSearchParams(window.location.search).get('hoje');
    if (fake && /^\d{4}-\d{2}-\d{2}$/.test(fake) && !Number.isNaN(fromIso(fake).getTime())) {
      sessionStorage.setItem('hoje', fake);
      return fake;
    }
    const kept = sessionStorage.getItem('hoje');
    if (kept && /^\d{4}-\d{2}-\d{2}$/.test(kept)) return kept;
  }
  return toIso(now);
}

export function isValidIso(iso: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(fromIso(iso).getTime()) && toIso(fromIso(iso)) === iso;
}
