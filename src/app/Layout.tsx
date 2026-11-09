import { useEffect, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { House, BookHeart, CalendarDays, Menu, WifiOff, RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSettings } from '../db/settings';
import { db } from '../db/database';
import { useOnline, useToday } from '../lib/hooks';
import { plannedReminders, scheduleWhileOpen } from '../services/reminders';
import { cx } from '../ui/kit';

const NAV = [
  { to: '/', label: 'Início', icon: House, end: true },
  { to: '/rezar', label: 'Rezar', icon: BookHeart, end: false },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays, end: false },
  { to: '/mais', label: 'Mais', icon: Menu, end: false },
];

/** Aplica tamanho de fonte e contraste no <html>. */
export function useAppearance() {
  const s = useSettings();
  useEffect(() => {
    if (!s) return;
    document.documentElement.dataset.font = s.fontSize;
    document.documentElement.dataset.contrast = s.highContrast ? 'alto' : 'normal';
  }, [s]);
}

/** Avisos enquanto o app está aberto (complemento; o calendário do celular é o caminho confiável). */
function useInAppReminders() {
  const s = useSettings();
  const today = useToday();
  const events = useLiveQuery(() => db.events.toArray(), []);
  useEffect(() => {
    if (!s || !events) return;
    const list = plannedReminders(s.reminders, Number(today.slice(0, 4)), events, s.presepioDate, today);
    return scheduleWhileOpen(list, today);
  }, [s, events, today]);
}

function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <div role="status" className="surgir mx-auto mb-4 flex max-w-2xl flex-wrap items-center gap-3 rounded-3xl bg-noite p-4 text-creme shadow-[var(--shadow-elevada)]">
      <RefreshCw aria-hidden className="size-5 shrink-0 text-dourado" />
      <p className="flex-1 font-bold">Nova versão disponível.</p>
      <div className="flex gap-2">
        <button type="button" className="min-h-11 rounded-full bg-dourado px-4 font-extrabold text-noite" onClick={() => updateServiceWorker(true)}>
          Atualizar
        </button>
        <button type="button" className="min-h-11 rounded-full px-3 font-bold text-creme underline underline-offset-4" onClick={() => setNeedRefresh(false)}>
          Depois
        </button>
      </div>
    </div>
  );
}

export function Layout({ children }: { children?: ReactNode }) {
  useInAppReminders();
  const online = useOnline();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const h1 = document.querySelector('main h1');
    if (h1 instanceof HTMLElement) {
      h1.tabIndex = -1;
      h1.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-creme">
      <a href="#conteudo" className="sr-only-focusable fixed left-2 top-2 z-50 rounded-full bg-roxo px-4 py-2 font-bold text-white">
        Pular para o conteúdo
      </a>
      <main id="conteudo" className="mx-auto max-w-2xl px-4 pb-36 pt-4">
        {!online && (
          <p className="mb-4 flex items-center gap-2 rounded-full bg-dourado-claro px-4 py-2 text-sm font-bold text-dourado-texto" role="status">
            <WifiOff aria-hidden className="size-4 shrink-0" /> Sem internet: orações, novena e agenda continuam funcionando.
          </p>
        )}
        <UpdateBanner />
        {children ?? <Outlet />}
      </main>
      <nav aria-label="Navegação principal" className="safe-bottom fixed inset-x-0 bottom-0 z-30 px-3 pb-3">
        <ul className="mx-auto grid max-w-xl grid-cols-4 rounded-[1.75rem] bg-papel/95 p-1.5 shadow-[var(--shadow-elevada)] ring-1 ring-borda backdrop-blur">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx('flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 rounded-3xl text-[0.8125rem] font-bold transition-colors', isActive ? 'text-roxo' : 'text-tinta-suave hover:text-roxo')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cx('grid h-8 w-14 place-items-center rounded-full transition-colors', isActive && 'bg-lavanda-claro')}>
                      <Icon aria-hidden className="size-6" strokeWidth={isActive ? 2.2 : 1.8} />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
