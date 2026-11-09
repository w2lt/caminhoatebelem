import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, CalendarDays, CalendarPlus, Church, History } from 'lucide-react';
import { db, EVENT_CATEGORIES, type AgendaEvent, type EventCategory } from '../../db/database';
import { nextEvent, splitUpcomingPast } from '../../db/events';
import { icsBlob } from '../../services/ics';
import { shareFile } from '../../services/share';
import { Button, EmptyState, MenuLink, PageHeader, SelectField } from '../../ui/kit';
import { useToast } from '../../ui/feedback';
import { EventLine, eventShareText } from '../shared';
import { ShareButton } from '../../ui/reading';

export function toIcsEvents(list: AgendaEvent[]) {
  return list
    .filter((e) => e.status !== 'cancelado')
    .map((e) => ({
      uid: e.id,
      title: e.title,
      date: e.date,
      time: e.time || undefined,
      location: [e.location, e.address].filter(Boolean).join(' — '),
      description: [EVENT_CATEGORIES[e.category], e.community && `Comunidade: ${e.community}`, e.responsible && `Responsável: ${e.responsible}`, e.description].filter(Boolean).join('\n'),
      alarmMinutes: e.reminderMinutes,
    }));
}

export function AgendaPage() {
  const all = useLiveQuery(() => db.events.toArray(), []);
  const [cat, setCat] = useState<EventCategory | 'todas'>('todas');
  const [verPassados, setVerPassados] = useState(false);
  const toast = useToast();

  const filtered = (all ?? []).filter((e) => cat === 'todas' || e.category === cat);
  const { upcoming, past } = splitUpcomingPast(filtered);
  const proximo = all ? nextEvent(all) : undefined;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agenda do Advento"
        subtitle="Missas, confissões, novenas e encontros da comunidade."
        actions={
          <Link to="/agenda/novo" className="inline-flex min-h-12 items-center gap-1 rounded-full bg-roxo pl-3 pr-4 font-extrabold text-white shadow-[0_6px_16px_rgb(96_55_125/0.28)]">
            <Plus aria-hidden className="size-5" /> Nova
          </Link>
        }
      />
      <MenuLink to="/missas" icon={Church} title="Missas de Natal" desc="Vigília, Noite, Aurora e Dia de Natal" tone="dourado" />

      <SelectField label="Mostrar" value={cat} onChange={(e) => setCat(e.target.value as EventCategory | 'todas')}>
        <option value="todas">Todas as atividades</option>
        {Object.entries(EVENT_CATEGORIES).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </SelectField>

      {all && all.length === 0 && (
        <EmptyState icon={CalendarDays} title="Sua agenda está vazia.">
          <p>Cadastre as Missas, confissões, novenas e encontros da sua comunidade.</p>
          <Link to="/agenda/novo" className="mt-3 inline-flex min-h-[3.25rem] items-center gap-1 rounded-full bg-roxo px-5 font-extrabold text-white">
            <Plus aria-hidden className="size-5" /> Cadastrar atividade
          </Link>
        </EmptyState>
      )}

      {all && all.length > 0 && (
        <section aria-labelledby="proximas">
          <h2 id="proximas" className="mb-2 font-display text-[1.75rem] leading-tight text-roxo">
            Próximas
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-tinta-suave">Nenhuma atividade futura {cat !== 'todas' && 'nesta categoria'}.</p>
          ) : (
            <ul className="grid gap-2">
              {upcoming.map((e) => (
                <li key={e.id}>
                  {proximo?.id === e.id && <p className="mb-1 text-sm font-bold uppercase tracking-wide text-roxo">Próximo compromisso</p>}
                  <EventLine e={e} highlight={proximo?.id === e.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {upcoming.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <ShareButton label="Programação" title="Programação do Advento" text={upcoming.map(eventShareText).join('\n\n')} />
          <Button
            variant="secundario"
            icon={CalendarPlus}
            onClick={async () => {
              const r = await shareFile(icsBlob(toIcsEvents(upcoming)), 'agenda-advento.ics', 'Agenda do Advento');
              if (r === 'downloaded') toast('Arquivo de calendário salvo. Abra-o para adicionar ao calendário do celular.');
            }}
          >
            Calendário
          </Button>
        </div>
      )}

      {past.length > 0 && (
        <section>
          <Button variant="suave" icon={History} full aria-expanded={verPassados} onClick={() => setVerPassados((v) => !v)}>
            {verPassados ? 'Ocultar anteriores' : `Ver compromissos anteriores (${past.length})`}
          </Button>
          {verPassados && (
            <ul className="mt-2 grid gap-2">
              {past.map((e) => (
                <li key={e.id}>
                  <EventLine e={e} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
