import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
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
        <div className="text-center">
          <img src="/icon.svg" alt="" className="mx-auto size-24" />
          <h1 className="mt-6 font-serif text-3xl font-bold text-roxo">Caminho até Belém</h1>
          <p className="mt-2 font-serif text-xl text-tinta-suave">Uma jornada de fé, oração e esperança para celebrar o verdadeiro Natal.</p>
          <ul className="mt-6 space-y-2 text-left text-lg">
            <li>🙏 Orações da manhã e da noite para cada dia</li>
            <li>📖 Liturgia diária e reflexões</li>
            <li>⭐ Novena de Natal e do seu Círculo Bíblico</li>
            <li>📅 Agenda da comunidade e Missas de Natal</li>
            <li>🕯️ Coroa do Advento, presépio e cânticos</li>
          </ul>
          <p className="mt-6 text-tinta-suave">Não é preciso cadastro. Tudo fica guardado só no seu celular.</p>
          <Button full className="mt-6" onClick={() => setStep(1)}>
            Começar <ChevronRight aria-hidden className="size-5" />
          </Button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h1 className="font-serif text-2xl font-bold text-roxo">Qual tamanho de letra é melhor para você?</h1>
          <p className="mt-1 text-tinta-suave">Você pode mudar depois, a qualquer momento.</p>
          <div className="mt-4 grid gap-3">
            {(['normal', 'grande', 'extra'] as FontSize[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={s?.fontSize === f}
                onClick={() => setSetting('fontSize', f)}
                className={cx('min-h-16 rounded-2xl border-2 px-4 text-left font-semibold', s?.fontSize === f ? 'border-roxo bg-roxo-claro text-roxo' : 'border-borda bg-papel', f === 'normal' ? 'text-base' : f === 'grande' ? 'text-xl' : 'text-2xl')}
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
          <h1 className="font-serif text-2xl font-bold text-roxo">Coloque o app na tela inicial</h1>
          <p className="mb-4 mt-1 text-tinta-suave">Assim ele abre como um aplicativo e funciona sem internet.</p>
          <InstallSteps />
          <Button full className="mt-6" onClick={() => setStep(3)}>
            Continuar <ChevronRight aria-hidden className="size-5" />
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-roxo">Tudo pronto!</h1>
          <p className="mt-2 text-lg">Seus dados ficam apenas neste celular. Lembre-se de fazer backup de vez em quando em Mais → Backup.</p>
          <Button full className="mt-6" onClick={() => setSetting('onboarded', true)}>
            Iniciar a jornada
          </Button>
        </div>
      )}
    </main>
  );
}
