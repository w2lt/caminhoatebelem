import { useEffect, useState } from 'react';
import { todayIso } from '../domain/dates';

/** Data de hoje, atualizada a cada minuto (vira o dia sem precisar recarregar). */
export function useToday(): string {
  const [today, setToday] = useState(() => todayIso());
  useEffect(() => {
    const t = setInterval(() => setToday(todayIso()), 60_000);
    return () => clearInterval(t);
  }, []);
  return today;
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/** Hora do dia para saudação e para destacar oração da manhã ou da noite. */
export function periodOfDay(now = new Date()): 'manha' | 'tarde' | 'noite' {
  const h = now.getHours();
  if (h >= 4 && h < 12) return 'manha';
  if (h >= 12 && h < 18) return 'tarde';
  return 'noite';
}

export function greeting(now = new Date()): string {
  const p = periodOfDay(now);
  return p === 'manha' ? 'Bom dia' : p === 'tarde' ? 'Boa tarde' : 'Boa noite';
}
