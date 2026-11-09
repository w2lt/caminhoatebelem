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
    <div role="status" className="mx-auto mb-3 flex max-w-2xl items-center gap-3 rounded-2xl bg-roxo p-3 text-white">
      <RefreshCw aria-hidden className="size-5 shrink-0" />
      <p className="flex-1">Nova versão disponível.</p>
      <button type="button" className="min-h-11 rounded-xl bg-white px-3 font-semibold text-roxo" onClick={() => updateServiceWorker(true)}>
        Atualizar
      </button>
      <button type="button" className="min-h-11 rounded-xl px-2 underline" onClick={() => setNeedRefresh(false)}>
        Depois
      </button>
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
      <a href="#conteudo" className="sr-only-focusable fixed left-2 top-2 z-50 rounded-lg bg-roxo px-3 py-2 text-white">
        Pular para o conteúdo
      </a>
      <main id="conteudo" className="mx-auto max-w-2xl px-4 pb-32 pt-4">
        {!online && (
          <p className="mb-3 flex items-center gap-2 rounded-xl bg-dourado-claro px-3 py-2 text-sm font-medium text-dourado-texto" role="status">
            <WifiOff aria-hidden className="size-4" /> Sem internet: orações, novena e agenda continuam funcionando.
          </p>
        )}
        <UpdateBanner />
        {children ?? <Outlet />}
      </main>
      <nav aria-label="Navegação principal" className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-papel">
        <ul className="mx-auto grid max-w-2xl grid-cols-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx('flex min-h-16 flex-col items-center justify-center gap-0.5 text-sm font-semibold', isActive ? 'text-roxo' : 'text-tinta-suave')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cx('grid h-8 w-14 place-items-center rounded-full', isActive && 'bg-roxo-claro')}>
                      <Icon aria-hidden className="size-6" />
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
