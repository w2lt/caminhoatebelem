/** Mensagens de feedback (toast) anunciadas a leitores de tela. */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface Toast {
  id: number;
  text: string;
  tone: 'ok' | 'erro';
}

const Ctx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {});

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);
  const show = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'erro' ? 7000 : 4000);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`surgir pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold text-creme shadow-[var(--shadow-elevada)] ${t.tone === 'erro' ? 'bg-erro' : 'bg-noite'}`}
          >
            {t.tone === 'erro' ? <AlertTriangle aria-hidden className="size-6 shrink-0" /> : <CheckCircle2 aria-hidden className="size-6 shrink-0 text-dourado" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
