import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Sun, Moon, Lightbulb, Quote, HandHeart, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { diaPorData } from '../../content';
import { liturgicalDay } from '../../domain/liturgical';
import { addDaysIso, isValidIso, longDate } from '../../domain/dates';
import { toggleMark, useMarks } from '../../db/progress';
import { EmptyState, PageHeader, ReviewNote } from '../../ui/kit';
import { DoneToggle, FontSizeControl, ReadingCard, ShareButton } from '../../ui/reading';

export function DiaPage() {
  const { data = '' } = useParams();
  const { hash } = useLocation();
  const dia = isValidIso(data) ? diaPorData(data) : undefined;
  const manha = useMarks('manha');
  const noite = useMarks('noite');
  const gesto = useMarks('gesto');

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    el?.scrollIntoView({ block: 'start' });
  }, [hash, dia]);

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

  return (
    <div className="space-y-4">
      <PageHeader title={dia.tema} subtitle={`${lit.rotulo} · ${longDate(dia.data)}`} back="/rezar" actions={<FontSizeControl />} />

      <section id="manha" className="scroll-mt-4">
        <ReadingCard
          id="t-manha"
          icon={<Sun aria-hidden className="size-5" />}
          kicker="Oração da manhã"
          title="Entrego a Deus o meu dia"
          tone="dourado"
          actions={
            <>
              <DoneToggle done={!!manha?.has(dia.data)} onToggle={() => toggleMark('manha', dia.data)} label="Marcar como rezada" doneLabel="Rezei" />
              <ShareButton title="Oração da manhã" text={dia.manha} card={{ kicker: 'Oração da manhã', title: dia.tema, body: dia.manha, footer }} />
            </>
          }
        >
          <p>{dia.manha}</p>
        </ReadingCard>
      </section>

      <ReadingCard
        id="t-reflexao"
        icon={<Lightbulb aria-hidden className="size-5" />}
        kicker="Reflexão"
        tone="verde"
        actions={<ShareButton title="Reflexão do dia" text={dia.reflexao} card={{ kicker: 'Reflexão do dia', title: dia.tema, body: dia.reflexao, footer }} />}
      >
        <p>{dia.reflexao}</p>
        <p className="mt-3 font-sans text-base">
          <Link to={`/liturgia/${dia.liturgiaId}`} className="inline-flex min-h-11 items-center gap-1 font-semibold text-roxo">
            <BookOpen aria-hidden className="size-5" /> Ver a liturgia deste dia
          </Link>
        </p>
      </ReadingCard>

      <ReadingCard
        icon={<Quote aria-hidden className="size-5" />}
        kicker="Frase do dia"
        tone="rosa"
        actions={<ShareButton title="Frase do dia" text={dia.frase} card={{ kicker: 'Frase do dia', body: `“${dia.frase}”`, footer }} />}
      >
        <p className="text-2xl italic text-rosa-texto">“{dia.frase}”</p>
      </ReadingCard>

      <ReadingCard
        icon={<HandHeart aria-hidden className="size-5" />}
        kicker="Gesto concreto"
        tone="verde"
        actions={<DoneToggle done={!!gesto?.has(dia.data)} onToggle={() => toggleMark('gesto', dia.data)} label="Marcar gesto feito" doneLabel="Feito" />}
      >
        <p>{dia.gesto}</p>
      </ReadingCard>

      <section id="noite" className="scroll-mt-4">
        <ReadingCard
          id="t-noite"
          icon={<Moon aria-hidden className="size-5" />}
          kicker="Oração para encerrar o dia"
          title="Agradeço, revejo, peço perdão e descanso em Deus"
          actions={
            <>
              <DoneToggle done={!!noite?.has(dia.data)} onToggle={() => toggleMark('noite', dia.data)} label="Marcar como rezada" doneLabel="Rezei" />
              <ShareButton title="Oração da noite" text={dia.noite} card={{ kicker: 'Oração da noite', title: dia.tema, body: dia.noite, footer }} />
            </>
          }
        >
          <ol className="mb-3 list-decimal pl-5 font-sans text-base text-tinta-suave">
            <li>Fique em silêncio por um instante e agradeça.</li>
            <li>Reveja o dia: onde encontrou Deus? Onde faltou amor?</li>
            <li>Peça perdão e entregue tudo nas mãos do Pai.</li>
          </ol>
          <p>{dia.noite}</p>
        </ReadingCard>
      </section>

      <ReviewNote show={dia.revisao === 'pendente'} />

      <nav aria-label="Outros dias" className="flex justify-between gap-2">
        {prev ? (
          <Link to={`/dia/${prev.data}`} className="inline-flex min-h-12 items-center gap-1 rounded-xl px-2 font-semibold text-roxo">
            <ChevronLeft aria-hidden className="size-5" /> Dia anterior
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/dia/${next.data}`} className="inline-flex min-h-12 items-center gap-1 rounded-xl px-2 font-semibold text-roxo">
            Próximo dia <ChevronRight aria-hidden className="size-5" />
          </Link>
        )}
      </nav>
    </div>
  );
}
