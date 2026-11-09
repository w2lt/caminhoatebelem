import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Sun, Moon, BookOpen, Star, CalendarDays, Sparkles, ChevronRight, Flame, Church, Plus, Home as HomeIcon } from 'lucide-react';
import { db } from '../../db/database';
import { nextEvent } from '../../db/events';
import { diaPorData, liturgiaPorData } from '../../content';
import { novena } from '../../content/novena';
import { liturgicalDay, novenaDates } from '../../domain/liturgical';
import { diffDays, longDate } from '../../domain/dates';
import { greeting, periodOfDay, useToday } from '../../lib/hooks';
import { Eyebrow, MenuLink, cx } from '../../ui/kit';
import { EventLine, LiturgicalColor } from '../shared';
import { Velas } from '../shared-visuals';
import { ConviteInstalar } from './ConviteInstalar';

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
  const noite = periodOfDay() === 'noite';
  const novenaIdx = novenaDates(ano).indexOf(today);
  const diasParaNovena = diffDays(novenaDates(ano)[0]!, today);
  const acesas = lit.season === 'advento' ? lit.semana ?? 0 : lit.season === 'antes-do-advento' ? 0 : 4;
  const [diaSemana, resto] = longDate(today).split(', ');
  const natal = lit.season === 'natal' || lit.season === 'tempo-do-natal';
  const evangelho = liturgia?.missas.at(-1)!.leituras.find((l) => l.tipo === 'Evangelho')?.referencia;

  const tituloHero =
    lit.season === 'advento' ? (lit.isDomingo ? lit.rotulo.replace(' · Gaudete', '') : `${lit.semana}ª semana do Advento`) : lit.season === 'antes-do-advento' ? 'Preparação para o Advento' : lit.rotulo;

  return (
    <div className="space-y-4">
      {/* Cabeçalho: céu de Belém, contagem e velas da semana */}
      <header className="ceu relative -mx-4 -mt-4 overflow-hidden px-5 pb-20 pt-7 text-creme">
        <p className="text-sm font-bold text-creme/85">{greeting()}</p>
        <p className="text-sm text-creme/75">
          {diaSemana}, {resto}
        </p>
        <h1 className="font-display mt-4 max-w-[14ch] text-[2.5rem] leading-[0.98] text-white">{tituloHero}</h1>
        {lit.isGaudete && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-rosa/50 bg-rosa/20 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-[#f5cfe0]">
            ✦ Gaudete · Alegrai-vos
          </p>
        )}
        {lit.diasParaNatal > 0 ? (
          <div className="mt-5 flex items-end justify-between gap-3">
          <p className="flex items-end gap-3">
            <strong className="font-display text-[4rem] leading-[0.75] text-dourado">{lit.season === 'antes-do-advento' ? lit.diasParaAdvento : lit.diasParaNatal}</strong>
            <span className="pb-0.5 text-[0.9375rem] leading-tight">
              {lit.season === 'antes-do-advento' ? (
                <>
                  dias para o
                  <br />
                  Advento
                </>
              ) : lit.diasParaNatal === 1 ? (
                <>
                  dia: amanhã
                  <br />é Natal!
                </>
              ) : (
                <>
                  dias para
                  <br />o Natal
                </>
              )}
            </span>
          </p>
          <Velas acesas={acesas} className="pb-1" />
          </div>
        ) : (
          <p className="font-display mt-5 text-[2rem] leading-none text-dourado">{lit.season === 'natal' ? 'Feliz e santo Natal!' : 'Tempo do Natal'}</p>
        )}
      </header>

      {lit.season === 'antes-do-advento' && (
        <section className="relative z-10 -mt-14 rounded-3xl bg-papel p-5 shadow-[var(--shadow-elevada)]" aria-labelledby="prep">
          <Eyebrow>Começa em {longDate(lit.cal.domingos[0]).split(', ')[1]}</Eyebrow>
          <h2 id="prep" className="font-display mt-1 text-[1.75rem] leading-tight">
            Prepare-se para o Advento
          </h2>
          <div className="mt-4 grid gap-2">
            <MenuLink to="/coroa" icon={Flame} title="Preparar a coroa do Advento" desc="Significado e montagem" tone="dourado" />
            <MenuLink to="/presepio" icon={Sparkles} title="Planejar o presépio" desc="Escolha a data de montagem" tone="verde" />
            <MenuLink to="/missas" icon={Church} title="Anotar as Missas de Natal" desc="Horários da sua comunidade" tone="rosa" />
            <MenuLink to={`/dia/${lit.cal.domingos[0]}`} icon={BookOpen} title="Ver o 1º dia da jornada" desc="Oração, reflexão e gesto" />
          </div>
        </section>
      )}

      {/* Oração do momento: o destaque principal da tela */}
      {dia && lit.season !== 'antes-do-advento' && (
        <section className="relative z-10 -mt-14 rounded-3xl bg-papel p-5 shadow-[var(--shadow-elevada)]" aria-labelledby="oracao-hoje">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-dourado-texto">
            {noite ? <Moon aria-hidden className="size-4" /> : <Sun aria-hidden className="size-4" />}
            {noite ? 'Oração da noite' : 'Oração da manhã'}
          </p>
          <h2 id="oracao-hoje" className="font-display mt-2 text-[1.75rem] leading-[1.08]">
            {dia.tema}
          </h2>
          <p className="leitura mt-2 line-clamp-2 text-[1.0625rem] text-tinta-suave">{noite ? dia.noite : dia.manha}</p>
          <Link
            to={`/dia/${dia.data}#${noite ? 'noite' : 'manha'}`}
            className="mt-4 flex min-h-[3.5rem] items-center justify-center gap-2 rounded-full bg-roxo text-[1.0625rem] font-extrabold text-white shadow-[0_6px_16px_rgb(96_55_125/0.28)] active:scale-[0.99]"
          >
            Rezar agora <ChevronRight aria-hidden className="size-5" />
          </Link>
          <Link to={`/dia/${dia.data}#${noite ? 'manha' : 'noite'}`} className="mt-2 flex min-h-11 items-center justify-center gap-2 font-bold text-lavanda-texto">
            {noite ? <Sun aria-hidden className="size-4" /> : <Moon aria-hidden className="size-4" />}
            {noite ? 'Oração da manhã' : 'Oração para encerrar o dia'}
          </Link>
        </section>
      )}

      <ConviteInstalar />

      {/* Atalhos: liturgia, novena, agenda */}
      <nav aria-label="Atalhos do dia" className="grid grid-cols-3 gap-2">
        <Tile to={liturgia ? `/liturgia/${liturgia.data}` : '/rezar'} icon={BookOpen} tone="bg-lavanda-claro text-roxo" title="Liturgia" desc={evangelho ?? 'Leituras do dia'} />
        <Tile
          to={novenaIdx >= 0 ? `/novena/${novenaIdx + 1}` : '/novena'}
          icon={Star}
          tone="bg-verde-claro text-verde"
          title="Novena"
          desc={novenaIdx >= 0 ? `Hoje: ${novenaIdx + 1}º encontro` : diasParaNovena > 0 ? `Começa em ${diasParaNovena} ${diasParaNovena === 1 ? 'dia' : 'dias'}` : '9 encontros'}
        />
        <Tile to="/agenda" icon={CalendarDays} tone="bg-dourado-claro text-dourado-texto" title="Agenda" desc="Missas e encontros" />
      </nav>

      {liturgia && (
        <p className="flex flex-wrap items-center justify-center gap-x-2 text-center text-sm text-tinta-suave">
          <LiturgicalColor cor={liturgia.cor} /> · {liturgia.celebracao}
        </p>
      )}

      {novenaIdx >= 0 && (
        <Link to={`/novena/${novenaIdx + 1}`} className="ceu block rounded-3xl p-5 text-creme shadow-[var(--shadow-elevada)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-dourado">Novena de Natal · hoje</p>
          <p className="font-display mt-1 text-[1.75rem] leading-tight text-white">
            {novenaIdx + 1}º encontro: {novena[novenaIdx]!.titulo}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 font-bold text-creme">
            Rezar o encontro <ChevronRight aria-hidden className="size-5" />
          </p>
        </Link>
      )}

      {/* Reflexão e frase do dia */}
      {dia && (
        <section className="rounded-3xl bg-papel p-5 shadow-[var(--shadow-suave)]" aria-labelledby="refl">
          <h2 id="refl" className="text-xs font-extrabold uppercase tracking-[0.14em] text-verde">
            Reflexão do dia
          </h2>
          <p className="leitura mt-2">{dia.reflexao}</p>
          <div className="ornamento mt-5" aria-hidden>
            ✦
          </div>
          <blockquote className="mt-3 text-center font-serif text-[1.25rem] italic leading-relaxed text-rosa-texto">“{dia.frase}”</blockquote>
          <Link to={`/dia/${dia.data}#frase`} className="mt-3 flex min-h-11 items-center justify-center gap-1 font-bold text-roxo">
            Gesto do dia e compartilhar <ChevronRight aria-hidden className="size-5" />
          </Link>
        </section>
      )}

      {/* Próximo compromisso */}
      <section aria-labelledby="prox" className="space-y-2">
        <h2 id="prox" className="flex items-center gap-2 px-1 text-xs font-extrabold uppercase tracking-[0.14em] text-lavanda-texto">
          <CalendarDays aria-hidden className="size-4" /> Próximo compromisso
        </h2>
        {proximo ? (
          <EventLine e={proximo} highlight />
        ) : (
          <Link to="/agenda/novo" className="flex min-h-[3.5rem] items-center gap-3 rounded-3xl bg-papel px-4 font-bold text-roxo shadow-[var(--shadow-suave)]">
            <span className="grid size-9 place-items-center rounded-full bg-lavanda-claro">
              <Plus aria-hidden className="size-5" />
            </span>
            Adicionar Missa, novena ou encontro
          </Link>
        )}
      </section>

      {!natal && lit.season !== 'antes-do-advento' && <MenuLink to="/familia" icon={HomeIcon} title="Advento em família" desc="Um convite simples para hoje" tone="rosa" />}
    </div>
  );
}

function Tile({ to, icon: Icon, tone, title, desc }: { to: string; icon: typeof BookOpen; tone: string; title: string; desc: string }) {
  return (
    <Link to={to} className="flex min-h-[6.5rem] flex-col gap-2 rounded-3xl bg-papel p-3 shadow-[var(--shadow-suave)] active:scale-[0.98]">
      <span className={cx('grid size-10 place-items-center rounded-2xl', tone)}>
        <Icon aria-hidden className="size-5" />
      </span>
      <span className="font-extrabold leading-tight">{title}</span>
      <span className="text-xs leading-snug text-tinta-suave">{desc}</span>
    </Link>
  );
}
