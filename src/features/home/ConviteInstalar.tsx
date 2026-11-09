import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { promptInstall, useInstallState } from '../../services/install';
import { useToast } from '../../ui/feedback';

const KEY = 'convite-instalar-dispensado';

function dispensado(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** Convite na tela inicial para criar o ícone do app (só aparece quando o navegador permite instalar). */
export function ConviteInstalar() {
  const state = useInstallState();
  const toast = useToast();
  const [fechado, setFechado] = useState(dispensado);
  if (state !== 'disponivel' || fechado) return null;

  const fechar = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* sem armazenamento: só esconde nesta sessão */
    }
    setFechado(true);
  };

  return (
    <section aria-labelledby="convite-instalar" className="flex items-start gap-3 rounded-3xl bg-papel p-4 shadow-[var(--shadow-suave)] ring-[1.5px] ring-inset ring-dourado">
      <img src="/pwa-192x192.png" alt="" className="size-12 shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1">
        <h2 id="convite-instalar" className="font-bold text-roxo">
          Crie o ícone do app
        </h2>
        <p className="text-tinta-suave [overflow-wrap:anywhere]">Abra com um toque, direto da tela inicial, e use sem internet.</p>
        <button
          type="button"
          onClick={async () => {
            if (await promptInstall()) toast('Pronto! O ícone do Caminho até Belém foi criado.');
          }}
          className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-roxo px-5 font-bold text-white"
        >
          <Download aria-hidden className="size-5" /> Instalar
        </button>
      </div>
      <button type="button" onClick={fechar} aria-label="Fechar convite para instalar" className="grid size-11 shrink-0 place-items-center rounded-full text-tinta-suave hover:bg-lavanda-claro">
        <X aria-hidden className="size-5" />
      </button>
    </section>
  );
}
