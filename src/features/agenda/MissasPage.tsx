import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Church, Info } from 'lucide-react';
import { db, MASS_TYPES, type MassType } from '../../db/database';
import { sortChronological } from '../../db/events';
import { liturgicalDay } from '../../domain/liturgical';
import { addDaysIso } from '../../domain/dates';
import { useToday } from '../../lib/hooks';
import { Card, EmptyState, PageHeader } from '../../ui/kit';
import { ShareButton } from '../../ui/reading';
import { EventLine, eventShareText } from '../shared';

export function MissasPage() {
  const today = useToday();
  const natal = liturgicalDay(today).cal.natal;
  const missas = useLiveQuery(() => db.events.where('category').equals('missa-natal').toArray(), []);
  const lista = sortChronological(missas ?? []);
  const sugestoes: [MassType, string][] = [
    ['vigilia', addDaysIso(natal, -1)],
    ['noite', addDaysIso(natal, -1)],
    ['aurora', natal],
    ['dia', natal],
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Missas de Natal" subtitle="Anote os horários das celebrações das igrejas que você frequenta." back="/agenda" />
      <Card>
        <p className="flex gap-2 text-tinta-suave">
          <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
          O app não sabe os horários da sua paróquia: confirme no aviso da igreja, no site ou nas redes sociais da comunidade e cadastre aqui.
        </p>
      </Card>

      <section aria-labelledby="adicionar">
        <h2 id="adicionar" className="mb-2 font-semibold">
          Adicionar celebração
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {sugestoes.map(([tipo, data]) => (
            <Link
              key={tipo}
              to={`/agenda/novo?categoria=missa-natal&missa=${tipo}&data=${data}`}
              className="flex min-h-14 items-center gap-2 rounded-xl border-2 border-dourado bg-dourado-claro p-2 text-sm font-semibold text-dourado-texto"
            >
              <Plus aria-hidden className="size-5 shrink-0" /> {MASS_TYPES[tipo].replace(/ \(.*\)$/, '')}
            </Link>
          ))}
          <Link to="/agenda/novo?categoria=missa-natal&missa=outra" className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-borda p-2 font-semibold text-roxo">
            <Plus aria-hidden className="size-5" /> Outra celebração
          </Link>
        </div>
      </section>

      <section aria-labelledby="cadastradas">
        <h2 id="cadastradas" className="mb-2 font-serif text-xl font-bold text-roxo">
          Celebrações cadastradas
        </h2>
        {lista.length === 0 ? (
          <EmptyState icon={Church} title="Nenhuma Missa cadastrada ainda." />
        ) : (
          <ul className="grid gap-2">
            {lista.map((e) => (
              <li key={e.id}>
                <EventLine e={e} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {lista.length > 0 && (
        <ShareButton
          label="Compartilhar horários"
          title="Missas de Natal"
          text={`Horários das Missas de Natal\n\n${lista.map(eventShareText).join('\n\n')}`}
          card={{ kicker: 'Missas de Natal', body: lista.map((e) => `${MASS_TYPES[e.massType ?? 'outra'].replace(/ \(.*\)$/, '')} — ${e.time || 'horário a confirmar'}\n${e.location}`).join('\n\n') }}
        />
      )}
    </div>
  );
}
