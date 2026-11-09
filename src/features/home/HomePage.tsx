import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Sun, Moon, BookOpen, Star, CalendarDays, Sparkles, ChevronRight, Flame, Church, Plus } from 'lucide-react';
import { db } from '../../db/database';
import { nextEvent } from '../../db/events';
import { diaPorData, liturgiaPorData } from '../../content';
import { novena } from '../../content/novena';
import { liturgicalDay, novenaDates } from '../../domain/liturgical';
import { diffDays, longDate } from '../../domain/dates';
import { greeting, periodOfDay, useToday } from '../../lib/hooks';
import { Card, MenuLink } from '../../ui/kit';
import { EventLine, LiturgicalColor } from '../shared';

export function HomePage() {
  const today = useToday();
  const lit = liturgicalDay(today);
  const ano = lit.cal.anoAdvento;
  // Depois do Natal, continua mostrando o conteúdo do Natal.
  const contentDate = lit.season === 'tempo-do-natal' ? lit.cal.natal : today;
  const dia = diaPorData(contentDate);
  const liturgia = liturgiaPorData(contentDate);
  const events = useLiveQuery(() => db.events.toArray(), []);
  const proximo = events ? nextEvent(events) : undefined;
  const periodo = periodOfDay();
  const noite = periodo === 'noite';

  const novenaIdx = novenaDates(ano).indexOf(today);
  const diasParaNovena = diffDays(novenaDates(ano)[0]!, today);

  return (
    <div className="space-y-4">
      <header className="rounded-3xl bg-roxo p-5 text-white">
        <p className="text-lg">{greeting()}!</p>
        <h1 className="font-serif text-2xl font-bold leading-tight">Meu Advento</h1>
        <p className="mt-1 text-white/90">{longDate(today)}</p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-semibold">
          <Star aria-hidden className="size-4 text-dourado" />
          {lit.rotulo}
        </p>
        {lit.diasParaNatal > 0 && (
          <p className="mt-3 text-lg">
            {lit.diasParaNatal === 1 ? (
              <strong>Amanhã é Natal!</strong>
            ) : (
              <>
                Faltam <strong className="text-2xl text-dourado">{lit.diasParaNatal}</strong> dias para o Natal
              </>
            )}
          </p>
        )}
        {lit.season === 'natal' && <p className="mt-3 text-xl font-bold text-dourado">Feliz e santo Natal!</p>}
      </header>

      {lit.season === 'antes-do-advento' && (
        <Card>
          <h2 className="font-serif text-xl font-bold text-roxo">Prepare-se para o Advento</h2>
          <p className="mt-1">
            O Advento de {ano} começa no domingo, <strong>{longDate(lit.cal.domingos[0]).split(', ')[1]}</strong>. Enquanto isso, você pode:
          </p>
          <div className="mt-3 grid gap-2">
            <MenuLink to="/coroa" icon={Flame} title="Preparar a coroa do Advento" desc="Significado e montagem" tone="dourado" />
            <MenuLink to="/presepio" icon={Sparkles} title="Planejar o presépio" desc="Escolha a data de montagem" tone="verde" />
            <MenuLink to="/missas" icon={Church} title="Anotar as Missas de Natal" desc="Horários da sua comunidade" tone="rosa" />
            <MenuLink to={`/dia/${lit.cal.domingos[0]}`} icon={BookOpen} title="Ver o 1º dia da jornada" desc="Oração, reflexão e gesto" />
          </div>
        </Card>
      )}

      {dia && (
        <Link to={`/dia/${dia.data}#${noite ? 'noite' : 'manha'}`} className="block rounded-2xl border-2 border-dourado bg-dourado-claro p-4 hover:border-roxo">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-dourado-texto">
            {noite ? <Moon aria-hidden className="size-5" /> : <Sun aria-hidden className="size-5" />}
            {noite ? 'Oração da noite' : 'Oração da manhã'}
            {lit.season === 'tempo-do-natal' && ' · Natal'}
          </p>
          <p className="mt-1 font-serif text-xl font-bold">{dia.tema}</p>
          <p className="leitura mt-1 line-clamp-3 text-tinta-suave">{noite ? dia.noite : dia.manha}</p>
          <span className="mt-2 inline-flex items-center gap-1 font-semibold text-roxo">
            Rezar agora <ChevronRight aria-hidden className="size-5" />
          </span>
        </Link>
      )}

      {liturgia && (
        <Link to={`/liturgia/${liturgia.data}`} className="block rounded-2xl border border-borda bg-papel p-4 hover:border-roxo">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-roxo">
            <BookOpen aria-hidden className="size-5" /> Liturgia do dia
          </p>
          <p className="mt-1 text-lg font-semibold">{liturgia.celebracao}</p>
          <p className="mt-1 text-tinta-suave">
            <LiturgicalColor cor={liturgia.cor} />
          </p>
          <p className="mt-1">Evangelho: {liturgia.missas.at(-1)!.leituras.find((l) => l.tipo === 'Evangelho')?.referencia}</p>
        </Link>
      )}

      {dia && (
        <Card>
          <p className="text-sm font-bold uppercase tracking-wide text-verde">Reflexão do dia</p>
          <p className="leitura mt-1">{dia.reflexao}</p>
          <blockquote className="mt-3 rounded-xl bg-rosa-claro p-3 font-serif text-lg italic text-rosa-texto">“{dia.frase}”</blockquote>
          <Link to={`/dia/${dia.data}`} className="mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-roxo">
            Gesto do dia e compartilhar <ChevronRight aria-hidden className="size-5" />
          </Link>
        </Card>
      )}

      {dia && (
        <Link to={`/dia/${dia.data}#${noite ? 'manha' : 'noite'}`} className="flex min-h-14 items-center gap-3 rounded-2xl border border-borda bg-papel p-3 hover:border-roxo">
          {noite ? <Sun aria-hidden className="size-6 text-dourado-texto" /> : <Moon aria-hidden className="size-6 text-roxo" />}
          <span className="flex-1 font-semibold">{noite ? 'Oração da manhã' : 'Oração para encerrar o dia'}</span>
          <ChevronRight aria-hidden className="size-5" />
        </Link>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-roxo">
            <CalendarDays aria-hidden className="size-5" /> Próximo compromisso
          </h2>
        </div>
        {proximo ? (
          <div className="mt-2">
            <EventLine e={proximo} highlight />
          </div>
        ) : (
          <Link to="/agenda/novo" className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold text-roxo">
            <Plus aria-hidden className="size-5" /> Adicionar Missa, novena ou encontro
          </Link>
        )}
      </Card>

      {(novenaIdx >= 0 || (diasParaNovena > 0 && diasParaNovena <= 10)) && (
        <Link to={novenaIdx >= 0 ? `/novena/${novenaIdx + 1}` : '/novena'} className="block rounded-2xl bg-verde p-4 text-white hover:opacity-95">
          <p className="text-sm font-bold uppercase tracking-wide text-white/85">Novena de Natal</p>
          {novenaIdx >= 0 ? (
            <p className="mt-1 text-lg font-semibold">
              Hoje: {novenaIdx + 1}º encontro — {novena[novenaIdx]!.titulo}
            </p>
          ) : (
            <p className="mt-1 text-lg font-semibold">Começa em {diasParaNovena} {diasParaNovena === 1 ? 'dia' : 'dias'} (16 de dezembro)</p>
          )}
        </Link>
      )}

      {lit.season !== 'antes-do-advento' && (
        <div className="grid gap-2">
          <MenuLink to="/novena" icon={Star} title="Novena de Natal" desc="Nove encontros, sozinho ou em família" tone="verde" />
          <MenuLink to="/familia" icon={Sparkles} title="Advento em família" desc="Uma proposta simples para cada dia" tone="rosa" />
        </div>
      )}
    </div>
  );
}
