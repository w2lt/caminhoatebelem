import { Link } from 'react-router-dom';
import { Check, Users, BookHeart } from 'lucide-react';
import { novena } from '../../content/novena';
import { setSetting, useSettings } from '../../db/settings';
import { useMarks } from '../../db/progress';
import { tinyDate } from '../../domain/dates';
import { useToday } from '../../lib/hooks';
import { Card, MenuLink, PageHeader, cx } from '../../ui/kit';

export function NovenaPage() {
  const s = useSettings();
  const feitos = useMarks('novena');
  const today = useToday();
  const mode = s?.novenaMode ?? 'app';
  const total = feitos?.size ?? 0;

  return (
    <div className="space-y-4">
      <PageHeader title="Novena de Natal" subtitle="Nove encontros de 16 a 24 de dezembro, para rezar sozinho ou em família." back="/rezar" />

      <Card>
        <fieldset>
          <legend className="font-semibold">Qual novena você vai acompanhar?</legend>
          <p className="text-sm text-tinta-suave">Você pode trocar quando quiser; nada do que já registrou é apagado.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                ['app', 'Novena do app', BookHeart],
                ['circulo', 'Círculo Bíblico', Users],
              ] as const
            ).map(([value, label, Icon]) => (
              <label key={value} className={cx('flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-2 text-center font-semibold', mode === value ? 'border-roxo bg-roxo-claro text-roxo' : 'border-borda')}>
                <input type="radio" name="modo" className="sr-only" checked={mode === value} onChange={() => setSetting('novenaMode', value)} />
                <Icon aria-hidden className="size-5" /> {label}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      {mode === 'circulo' && <MenuLink to="/circulo" icon={Users} title="Abrir a novena do meu Círculo Bíblico" desc="Encontros, endereços, famílias e PDF" tone="verde" />}

      <section aria-labelledby="encontros">
        <div className="mb-2 flex items-end justify-between">
          <h2 id="encontros" className="font-serif text-xl font-bold text-roxo">
            {mode === 'circulo' ? 'Novena do app (para consulta)' : 'Os nove encontros'}
          </h2>
          <p className="font-semibold text-verde" aria-live="polite">
            {total} de 9 realizados
          </p>
        </div>
        <div className="mb-3 h-3 overflow-hidden rounded-full bg-[#e7dfe9]" role="progressbar" aria-valuemin={0} aria-valuemax={9} aria-valuenow={total} aria-label="Progresso da novena">
          <div className="h-full bg-verde transition-all" style={{ width: `${(total / 9) * 100}%` }} />
        </div>
        <ol className="grid gap-2">
          {novena.map((n) => {
            const done = feitos?.has(String(n.numero));
            const isHoje = n.dataSugerida === today;
            return (
              <li key={n.numero}>
                <Link
                  to={`/novena/${n.numero}`}
                  className={cx('flex min-h-16 items-center gap-3 rounded-2xl border p-3 hover:border-roxo', isHoje ? 'border-2 border-roxo bg-roxo-claro' : 'border-borda bg-papel')}
                >
                  <span className={cx('grid size-11 shrink-0 place-items-center rounded-full text-lg font-bold', done ? 'bg-verde text-white' : 'bg-roxo-claro text-roxo')}>
                    {done ? <Check aria-label="realizado" className="size-6" /> : n.numero}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-tinta-suave">
                      {n.numero}º encontro · {tinyDate(n.dataSugerida)}
                      {isHoje && ' · hoje'}
                    </span>
                    <span className="block font-semibold">{n.titulo}</span>
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
