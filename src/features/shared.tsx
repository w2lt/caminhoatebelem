/** Peças compartilhadas entre telas (cor litúrgica, cartões de evento, contagem). */
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { CORES_LITURGICAS } from '../content/tradicoes';
import { EVENT_CATEGORIES, MASS_TYPES, type AgendaEvent } from '../db/database';
import { tinyDate } from '../domain/dates';
import { Badge, cx } from '../ui/kit';

export function LiturgicalColor({ cor, withText = true }: { cor: string; withText?: boolean }) {
  const c = CORES_LITURGICAS[cor];
  if (!c) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="inline-block size-4 rounded-full border border-black/20" style={{ background: c.hex }} />
      {withText && <span>Cor litúrgica: {c.nome}</span>}
    </span>
  );
}

export function EventLine({ e, highlight }: { e: AgendaEvent; highlight?: boolean }) {
  const cat = e.category === 'missa-natal' && e.massType ? MASS_TYPES[e.massType] : EVENT_CATEGORIES[e.category];
  return (
    <Link
      to={`/agenda/${e.id}`}
      className={cx('block rounded-3xl p-4 shadow-[var(--shadow-suave)] active:scale-[0.99]', highlight ? 'bg-lavanda-claro ring-2 ring-roxo' : 'bg-papel', e.status === 'cancelado' && 'opacity-70')}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={e.category === 'missa-natal' ? 'dourado' : 'roxo'}>{cat}</Badge>
        {e.status === 'realizado' && <Badge tone="verde">Realizado</Badge>}
        {e.status === 'cancelado' && <Badge tone="cinza">Cancelado</Badge>}
      </div>
      <p className={cx('mt-1 text-lg font-bold', e.status === 'cancelado' && 'line-through')}>{e.title}</p>
      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-tinta-suave">
        <span className="inline-flex items-center gap-1">
          <Clock aria-hidden className="size-4" /> {tinyDate(e.date)}
          {e.time && ` · ${e.time}`}
        </span>
        {e.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden className="size-4" /> {e.location}
          </span>
        )}
      </p>
    </Link>
  );
}

export function eventShareText(e: AgendaEvent): string {
  const cat = e.category === 'missa-natal' && e.massType ? MASS_TYPES[e.massType] : EVENT_CATEGORIES[e.category];
  return [
    `${e.title}`,
    `${cat}`,
    `📅 ${tinyDate(e.date)}${e.time ? ` às ${e.time}` : ''}`,
    e.location ? `⛪ ${e.location}` : '',
    e.address ? `📍 ${e.address}` : '',
    e.community ? `Comunidade: ${e.community}` : '',
    e.responsible ? `Responsável: ${e.responsible}` : '',
    e.description,
  ]
    .filter(Boolean)
    .join('\n');
}
