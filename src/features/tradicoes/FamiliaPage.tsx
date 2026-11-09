import { Link } from 'react-router-dom';
import { Home, Check } from 'lucide-react';
import { pacoteDoAno } from '../../content';
import { liturgicalDay } from '../../domain/liturgical';
import { tinyDate } from '../../domain/dates';
import { toggleMark, useMarks } from '../../db/progress';
import { useToday } from '../../lib/hooks';
import { Card, PageHeader, cx } from '../../ui/kit';

export function FamiliaPage() {
  const today = useToday();
  const ano = liturgicalDay(today).cal.anoAdvento;
  const dias = pacoteDoAno(ano)?.dias ?? [];
  const feitos = useMarks('familia');

  return (
    <div className="space-y-4">
      <PageHeader title="Advento em família" subtitle="Um convite simples por dia: oração, caridade e convivência." back="/mais" />
      <Card>
        <p className="flex gap-2">
          <Home aria-hidden className="mt-0.5 size-5 shrink-0 text-verde" />
          São convites, não tarefas. Façam o que for possível, no ritmo da família — o importante é caminhar juntos.
        </p>
      </Card>
      <ol className="grid gap-2">
        {dias.map((d) => {
          const done = !!feitos?.has(d.data);
          const isHoje = d.data === today;
          return (
            <li key={d.data} className={cx('rounded-3xl bg-papel p-4 shadow-[var(--shadow-suave)]', isHoje && 'ring-2 ring-roxo')}>
              <p className="text-sm text-tinta-suave">
                {tinyDate(d.data)}
                {isHoje && ' · hoje'} ·{' '}
                <Link to={`/dia/${d.data}`} className="font-bold text-roxo underline">
                  {d.tema}
                </Link>
              </p>
              <div className="mt-1 flex items-start gap-3">
                <p className="flex-1 text-lg">{d.familia}</p>
                <button
                  type="button"
                  aria-pressed={done}
                  aria-label={done ? `Desmarcar: ${d.familia}` : `Marcar como feito: ${d.familia}`}
                  onClick={() => toggleMark('familia', d.data)}
                  className={cx('grid size-12 shrink-0 place-items-center rounded-full', done ? 'bg-verde text-white' : 'bg-verde-claro text-verde')}
                >
                  <Check aria-hidden className="size-6" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
