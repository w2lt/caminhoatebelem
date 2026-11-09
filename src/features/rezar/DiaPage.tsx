import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Sun, Moon, Lightbulb, Quote, HandHeart, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { diaPorData } from '../../content';
import { liturgicalDay } from '../../domain/liturgical';
import { addDaysIso, isValidIso, longDate } from '../../domain/dates';
import { toggleMark, useMarks } from '../../db/progress';
import { EmptyState, PageHeader, ReviewNote, cx } from '../../ui/kit';
import { DoneToggle, FontSizeControl, ReadingCard, ShareButton } from '../../ui/reading';

/**
 * Página do dia, organizada em abas para evitar uma rolagem longa:
 * Manhã · Reflexão · Frase · Gesto · Noite. O endereço com #manha, #reflexao, #frase, #gesto ou #noite
 * abre direto na aba (usado pela tela inicial). Abas seguem o padrão ARIA (setas ← → trocam de aba).
 */
const TABS = [
  { id: 'manha', label: 'Manhã', icon: Sun },
  { id: 'reflexao', label: 'Reflexão', icon: Lightbulb },
  { id: 'frase', label: 'Frase', icon: Quote },
  { id: 'gesto', label: 'Gesto', icon: HandHeart },
  { id: 'noite', label: 'Noite', icon: Moon },
] as const;
type TabId = (typeof TABS)[number]['id'];
const isTab = (v: string): v is TabId => TABS.some((t) => t.id === v);

export function DiaPage() {
  const { data = '' } = useParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const dia = isValidIso(data) ? diaPorData(data) : undefined;
  const manha = useMarks('manha');
  const noite = useMarks('noite');
  const gesto = useMarks('gesto');
  const fromHash = hash.slice(1);
  const [tab, setTab] = useState<TabId>(isTab(fromHash) ? fromHash : 'manha');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isTab(fromHash)) setTab(fromHash);
  }, [fromHash, data]);

  if (!dia) {
    return (
      <div>
        <PageHeader title="Dia não encontrado" back="/rezar" />
        <EmptyState icon={BookOpen} title="Ainda não há conteúdo para esta data.">
          O conteúdo é organizado por ano do Advento. Quando o pacote deste ano for publicado, ele aparecerá aqui após a atualização do app.
        </EmptyState>
      </div>
    );
  }

  const lit = liturgicalDay(dia.data);
  const footer = `${lit.rotulo} · ${longDate(dia.data).split(', ')[1]}`;
  const prev = diaPorData(addDaysIso(dia.data, -1));
  const next = diaPorData(addDaysIso(dia.data, 1));
  const done: Partial<Record<TabId, boolean>> = { manha: !!manha?.has(dia.data), gesto: !!gesto?.has(dia.data), noite: !!noite?.has(dia.data) };

  function select(id: TabId, focus = false) {
    setTab(id);
    navigate({ hash: id }, { replace: true });
    if (focus) tabRefs.current[TABS.findIndex((t) => t.id === id)]?.focus();
  }

  function onKey(e: KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === tab);
    const go = (j: number) => {
      e.preventDefault();
      select(TABS[(j + TABS.length) % TABS.length]!.id, true);
    };
    if (e.key === 'ArrowRight') go(i + 1);
    else if (e.key === 'ArrowLeft') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(TABS.length - 1);
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow={lit.rotulo} title={dia.tema} subtitle={longDate(dia.data).replace(/ de \d{4}$/, '')} back="/rezar" actions={<FontSizeControl />} />

      <div role="tablist" aria-label="Partes do dia" onKeyDown={onKey} className="sticky top-2 z-20 grid grid-cols-5 gap-0.5 rounded-full bg-lavanda-claro/95 p-1 shadow-[var(--shadow-suave)] backdrop-blur">
        {TABS.map((t, i) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`painel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(t.id)}
              // rótulo limitado pela largura da tela para caber 5 abas mesmo com a letra "Extra grande"
              className={cx('relative flex min-h-12 min-w-0 flex-col items-center justify-center rounded-full text-[min(0.75rem,3.5vw)] font-extrabold leading-none transition-colors', on ? 'bg-papel text-tinta shadow-[0_1px_3px_rgb(46_26_64/0.15)]' : 'text-lavanda-texto')}
            >
              <t.icon aria-hidden className="mb-0.5 size-4" />
              {t.label}
              {done[t.id] && (
                <>
                  <span aria-hidden className="absolute right-2 top-1.5 size-2 rounded-full bg-verde" />
                  <span className="sr-only"> (feito)</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`painel-${tab}`} aria-labelledby={`tab-${tab}`} className="surgir" key={tab}>
        {tab === 'manha' && (
          <ReadingCard
            id="t-manha"
            icon={<Sun aria-hidden className="size-4" />}
            kicker="Oração da manhã"
            title="Entrego a Deus o meu dia"
            tone="dourado"
            actions={
              <>
                <DoneToggle done={done.manha!} onToggle={() => toggleMark('manha', dia.data)} label="Marcar como rezada" doneLabel="Rezei" />
                <ShareButton title="Oração da manhã" text={dia.manha} card={{ kicker: 'Oração da manhã', title: dia.tema, body: dia.manha, footer }} />
              </>
            }
          >
            <p className="capitular">{dia.manha}</p>
          </ReadingCard>
        )}

        {tab === 'reflexao' && (
          <ReadingCard
            id="t-reflexao"
            icon={<Lightbulb aria-hidden className="size-4" />}
            kicker="Reflexão"
            title={dia.tema}
            tone="verde"
            actions={
              <>
                <ShareButton title="Reflexão do dia" text={dia.reflexao} card={{ kicker: 'Reflexão do dia', title: dia.tema, body: dia.reflexao, footer }} />
                <Link to={`/liturgia/${dia.liturgiaId}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-lavanda-claro px-4 font-bold text-roxo">
                  <BookOpen aria-hidden className="size-5" /> Liturgia do dia
                </Link>
              </>
            }
          >
            <p>{dia.reflexao}</p>
          </ReadingCard>
        )}

        {tab === 'frase' && (
          <article className="ceu rounded-3xl p-6 text-center text-creme shadow-[var(--shadow-elevada)]" aria-labelledby="t-frase">
            <p id="t-frase" className="text-xs font-extrabold uppercase tracking-[0.14em] text-dourado">
              Frase do dia
            </p>
            <p className="font-serif mt-6 text-[1.625rem] italic leading-[1.5] text-white">“{dia.frase}”</p>
            <div className="ornamento mx-auto mt-6 max-w-48" aria-hidden>
              ✦
            </div>
            <div className="mt-5 flex justify-center">
              <ShareButton title="Frase do dia" text={dia.frase} card={{ kicker: 'Frase do dia', body: `“${dia.frase}”`, footer }} />
            </div>
          </article>
        )}

        {tab === 'gesto' && (
          <ReadingCard
            id="t-gesto"
            icon={<HandHeart aria-hidden className="size-4" />}
            kicker="Gesto concreto"
            title="Um passo de amor hoje"
            tone="verde"
            actions={<DoneToggle done={done.gesto!} onToggle={() => toggleMark('gesto', dia.data)} label="Marcar gesto feito" doneLabel="Feito" />}
          >
            <p>{dia.gesto}</p>
            <p className="mt-4 rounded-2xl bg-rosa-claro p-4 font-sans text-base text-rosa-texto">
              <strong>Em família:</strong> {dia.familia}
            </p>
          </ReadingCard>
        )}

        {tab === 'noite' && (
          <ReadingCard
            id="t-noite"
            icon={<Moon aria-hidden className="size-4" />}
            kicker="Oração para encerrar o dia"
            title="Agradeço, revejo, peço perdão e descanso em Deus"
            actions={
              <>
                <DoneToggle done={done.noite!} onToggle={() => toggleMark('noite', dia.data)} label="Marcar como rezada" doneLabel="Rezei" />
                <ShareButton title="Oração da noite" text={dia.noite} card={{ kicker: 'Oração da noite', title: dia.tema, body: dia.noite, footer }} />
              </>
            }
          >
            <ol className="mb-4 grid gap-2 font-sans text-base text-tinta-suave">
              {['Fique em silêncio por um instante e agradeça.', 'Reveja o dia: onde encontrou Deus? Onde faltou amor?', 'Peça perdão e entregue tudo nas mãos do Pai.'].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-lavanda-claro text-sm font-extrabold text-roxo">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <p className="capitular">{dia.noite}</p>
          </ReadingCard>
        )}
      </div>

      <ReviewNote show={dia.revisao === 'pendente'} />

      <nav aria-label="Outros dias" className="flex flex-wrap justify-between gap-2">
        {prev ? (
          <Link to={`/dia/${prev.data}#${tab}`} className="inline-flex min-h-12 items-center gap-1 rounded-full bg-papel pl-2 pr-4 font-bold text-roxo shadow-[var(--shadow-suave)]">
            <ChevronLeft aria-hidden className="size-5" /> Dia anterior
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/dia/${next.data}#${tab}`} className="inline-flex min-h-12 items-center gap-1 rounded-full bg-papel pl-4 pr-2 font-bold text-roxo shadow-[var(--shadow-suave)]">
            Próximo dia <ChevronRight aria-hidden className="size-5" />
          </Link>
        )}
      </nav>
    </div>
  );
}
