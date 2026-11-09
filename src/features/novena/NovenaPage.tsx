import { Link } from 'react-router-dom';
import { Check, Users, BookHeart } from 'lucide-react';
import { novena } from '../../content/novena';
import { setSetting, useSettings } from '../../db/settings';
import { useMarks } from '../../db/progress';
import { tinyDate } from '../../domain/dates';
import { useToday } from '../../lib/hooks';
import { Card, MenuLink, PageHeader, cx } from '../../ui/kit';
import { EstrelasNovena } from '../shared-visuals';

export function NovenaPage() {
  const s = useSettings();
  const feitos = useMarks('novena');
  const today = useToday();
  const mode = s?.novenaMode ?? 'app';
  const total = feitos?.size ?? 0;

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="16 a 24 de dezembro" title="Novena de Natal" subtitle="Nove encontros para rezar sozinho ou em família." back="/rezar" art="/ilustracoes/presepio.webp" />

      <Card>
        <fieldset>
          <legend className="font-bold">Qual novena você vai acompanhar?</legend>
          <p className="text-sm text-tinta-suave">Você pode trocar quando quiser; nada do que já registrou é apagado.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                ['app', 'Novena do app', BookHeart],
                ['circulo', 'Círculo Bíblico', Users],
              ] as const
            ).map(([value, label, Icon]) => (
              <label
                key={value}
                className={cx(
                  'flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl p-2 text-center font-bold leading-tight ring-[1.5px] ring-inset transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-dourado-texto',
                  mode === value ? 'bg-roxo text-white ring-roxo' : 'bg-papel text-lavanda-texto ring-lavanda',
                )}
              >
                <input type="radio" name="modo" className="sr-only" checked={mode === value} onChange={() => setSetting('novenaMode', value)} />
                <Icon aria-hidden className="size-5" /> {label}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      {mode === 'circulo' && <MenuLink to="/circulo" icon={Users} title="Abrir a novena do meu Círculo Bíblico" desc="Encontros, endereços, famílias e PDF" tone="verde" />}

      <section aria-labelledby="encontros">
        <h2 id="encontros" className="mb-3 font-display text-[1.75rem] leading-tight text-roxo">
          {mode === 'circulo' ? 'Novena do app (para consulta)' : 'Os nove encontros'}
        </h2>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-noite px-5 py-4 text-creme shadow-[var(--shadow-suave)]">
          <EstrelasNovena feitos={total} />
          <p className="font-extrabold text-dourado" aria-live="polite">
            {total} de 9 realizados
          </p>
        </div>
        <ol className="grid gap-2">
          {novena.map((n) => {
            const done = feitos?.has(String(n.numero));
            const isHoje = n.dataSugerida === today;
            return (
              <li key={n.numero}>
                <Link
                  to={`/novena/${n.numero}`}
                  className={cx('flex min-h-[4.5rem] items-center gap-4 rounded-3xl p-3.5 shadow-[var(--shadow-suave)] active:scale-[0.99]', isHoje ? 'bg-lavanda-claro ring-2 ring-roxo' : 'bg-papel')}
                >
                  <span className={cx('grid size-12 shrink-0 place-items-center rounded-full text-lg font-extrabold', done ? 'bg-verde text-white' : 'bg-lavanda-claro text-roxo')}>
                    {done ? <Check aria-label="realizado" className="size-6" /> : n.numero}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-tinta-suave">
                      {n.numero}º encontro · {tinyDate(n.dataSugerida)}
                      {isHoje && ' · hoje'}
                    </span>
                    <span className="block font-bold">{n.titulo}</span>
                    <span className="block text-sm text-tinta-suave">{n.tema}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
