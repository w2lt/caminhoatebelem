import { useState } from 'react';
import { ChevronRight, Sun, BookOpen, Star, CalendarDays, Flame } from 'lucide-react';
import { setSetting, useSettings } from '../../db/settings';
import type { FontSize } from '../../db/database';
import { capabilities } from '../../services/reminders';
import { Button, cx } from '../../ui/kit';
import { FONT_LABEL } from '../../ui/reading';
import { InstallSteps } from './AjudaPage';

/** Primeiro uso: apresentação, escolha do tamanho do texto e orientação de instalação. Sem cadastro. */
export function BoasVindasPage() {
  const s = useSettings();
  const [step, setStep] = useState(0);
  const cap = capabilities();

  return (
    <main className="mx-auto min-h-dvh max-w-lg bg-creme px-4 py-8">
      {step === 0 && (
        <div>
          <div className="ceu -mx-4 -mt-8 px-6 pb-16 pt-12 text-center text-creme">
            <img src="/icon.svg" alt="" className="mx-auto size-20 rounded-[1.4rem] shadow-[var(--shadow-elevada)]" />
            <h1 className="font-display mt-6 text-[2.75rem] leading-[0.95] text-white">Caminho até Belém</h1>
            <p className="font-serif mx-auto mt-3 max-w-[26ch] text-lg italic text-creme">Uma jornada de fé, oração e esperança para celebrar o verdadeiro Natal.</p>
          </div>
          <ul className="relative -mt-10 grid gap-1 rounded-3xl bg-papel p-3 text-left shadow-[var(--shadow-elevada)]">
            {(
              [
                [Sun, 'Orações da manhã e da noite para cada dia'],
                [BookOpen, 'Liturgia diária e reflexões'],
                [Star, 'Novena de Natal e do seu Círculo Bíblico'],
                [CalendarDays, 'Agenda da comunidade e Missas de Natal'],
                [Flame, 'Coroa do Advento, presépio e cânticos'],
              ] as const
            ).map(([Icon, t]) => (
              <li key={t} className="flex min-h-12 items-center gap-3 px-2 text-[1.0625rem] font-bold">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-lavanda-claro text-roxo">
                  <Icon aria-hidden className="size-5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-tinta-suave">Não é preciso cadastro. Tudo fica guardado só no seu celular.</p>
          <Button full className="mt-6" onClick={() => setStep(1)}>
            Começar <ChevronRight aria-hidden className="size-5" />
          </Button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h1 className="font-display text-[2rem] leading-tight text-roxo">Qual tamanho de letra é melhor para você?</h1>
          <p className="mt-1 text-tinta-suave">Você pode mudar depois, a qualquer momento.</p>
          <div className="mt-4 grid gap-3">
            {(['normal', 'grande', 'extra'] as FontSize[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={s?.fontSize === f}
                onClick={() => setSetting('fontSize', f)}
                className={cx('min-h-16 rounded-2xl px-5 text-left font-bold ring-[1.5px] ring-inset', s?.fontSize === f ? 'bg-lavanda-claro text-roxo ring-roxo' : 'bg-papel ring-borda', f === 'normal' ? 'text-base' : f === 'grande' ? 'text-xl' : 'text-2xl')}
              >
                {FONT_LABEL[f]}
              </button>
            ))}
          </div>
          <Button full className="mt-6" onClick={() => setStep(cap.standalone ? 3 : 2)}>
            Continuar <ChevronRight aria-hidden className="size-5" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="font-display text-[2rem] leading-tight text-roxo">Coloque o app na tela inicial</h1>
          <p className="mb-4 mt-1 text-tinta-suave">Assim ele abre como um aplicativo e funciona sem internet.</p>
          <InstallSteps />
          <Button full className="mt-6" onClick={() => setStep(3)}>
            Continuar <ChevronRight aria-hidden className="size-5" />
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center">
          <h1 className="font-display text-[2rem] leading-tight text-roxo">Tudo pronto!</h1>
          <p className="mt-2 text-lg">Seus dados ficam apenas neste celular. Lembre-se de fazer backup de vez em quando em Mais → Backup.</p>
          <Button full className="mt-6" onClick={() => setSetting('onboarded', true)}>
            Iniciar a jornada
          </Button>
        </div>
      )}
    </main>
  );
}
