import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, ExternalLink as ExtIcon, Info, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { fontesOficiais, liturgiaPorData } from '../../content';
import { CORES_LITURGICAS } from '../../content/tradicoes';
import { addDaysIso, isValidIso, longDate } from '../../domain/dates';
import { liturgicalDay } from '../../domain/liturgical';
import { useOnline } from '../../lib/hooks';
import { Badge, Card, EmptyState, ExternalLink, PageHeader, ReviewNote } from '../../ui/kit';
import { FontSizeControl, ReadingCard, ShareButton } from '../../ui/reading';
import { LiturgicalColor } from '../shared';

export function LiturgiaPage() {
  const { data = '' } = useParams();
  const online = useOnline();
  const lit = isValidIso(data) ? liturgiaPorData(data) : undefined;

  if (!lit) {
    return (
      <div>
        <PageHeader title="Liturgia diária" back="/rezar" />
        <EmptyState icon={BookOpen} title="Ainda não há liturgia cadastrada para esta data.">
          {isValidIso(data) && (
            <ul className="mt-2 space-y-2">
              {fontesOficiais(data).map((f) => (
                <li key={f.url}>
                  <ExternalLink href={f.url}>{f.nome}</ExternalLink>
                </li>
              ))}
            </ul>
          )}
        </EmptyState>
      </div>
    );
  }

  const ld = liturgicalDay(lit.data);
  const cor = CORES_LITURGICAS[lit.cor]!;
  const prev = liturgiaPorData(addDaysIso(lit.data, -1));
  const next = liturgiaPorData(addDaysIso(lit.data, 1));
  const pendente = lit.missas.some((m) => m.leituras.some((l) => l.validacao === 'pendente'));

  return (
    <div className="space-y-4">
      <PageHeader title="Liturgia diária" subtitle={longDate(lit.data)} back="/rezar" actions={<FontSizeControl />} />

      <Card className="overflow-hidden" aria-labelledby="celebracao">
        <div aria-hidden className="-mx-4 -mt-4 mb-3 h-2" style={{ background: cor.hex }} />
        <h2 id="celebracao" className="font-serif text-xl font-bold">
          {lit.celebracao}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge>{lit.grau}</Badge>
          {ld.season === 'advento' && <Badge tone="cinza">Ano {ld.cal.ciclo}</Badge>}
        </div>
        <p className="mt-2">
          <LiturgicalColor cor={lit.cor} /> — {cor.sentido}
        </p>
        {lit.observacao && (
          <p className="mt-2 flex gap-2 text-tinta-suave">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0" /> {lit.observacao}
          </p>
        )}
      </Card>

      {lit.missas.map((m, i) => (
        <Card key={i} aria-labelledby={`missa-${i}`}>
          <h2 id={`missa-${i}`} className="font-serif text-lg font-bold text-roxo">
            {m.nome ?? 'Leituras da Missa'}
          </h2>
          <dl className="mt-2 divide-y divide-borda">
            {m.leituras.map((l) => (
              <Fragment key={l.tipo + l.referencia}>
              {l.tipo === 'Evangelho' && !m.leituras.some((x) => x.tipo === 'Aclamação ao Evangelho') && (
                <div className="py-2">
                  <dt className="text-sm font-bold uppercase tracking-wide text-tinta-suave">Aclamação ao Evangelho</dt>
                  <dd className="text-tinta-suave">Conforme o Lecionário — veja na fonte oficial.</dd>
                </div>
              )}
              <div className="py-2">
                <dt className="text-sm font-bold uppercase tracking-wide text-tinta-suave">{l.tipo}</dt>
                <dd className="text-lg font-semibold">
                  {l.referencia}
                  {l.alternativa && <span className="block text-base font-normal text-tinta-suave">{l.alternativa}</span>}
                  {l.textoIntegral && (
                    <span className="leitura mt-1 block font-normal">
                      {l.textoIntegral.texto}
                      <span className="mt-1 block font-sans text-xs text-tinta-suave">Fonte: {l.textoIntegral.fonte} · {l.textoIntegral.licenca}</span>
                    </span>
                  )}
                </dd>
              </div>
              </Fragment>
            ))}
          </dl>
        </Card>
      ))}

      <Card aria-labelledby="fontes">
        <h2 id="fontes" className="flex items-center gap-2 font-semibold">
          <ExtIcon aria-hidden className="size-5 text-roxo" /> Ler os textos completos
        </h2>
        <p className="mt-1 text-tinta-suave">
          Os textos bíblicos e litúrgicos oficiais têm direitos autorais e não são reproduzidos no app. Leia na sua Bíblia pelas referências acima ou nas fontes abaixo
          {online ? '.' : ' (é preciso estar conectado à internet).'}
        </p>
        <ul className="mt-2 space-y-2">
          {fontesOficiais(lit.data).map((f) => (
            <li key={f.url}>
              <ExternalLink href={f.url}>{f.nome}</ExternalLink>
            </li>
          ))}
        </ul>
        {pendente && <p className="mt-3 text-xs text-tinta-suave">Referências conforme o Lecionário Romano, em conferência editorial com o Diretório Litúrgico da CNBB.</p>}
      </Card>

      <ReadingCard
        kicker="Reflexão sobre o Evangelho"
        tone="verde"
        actions={<ShareButton title="Reflexão sobre o Evangelho" text={lit.reflexao} card={{ kicker: 'Reflexão do Evangelho', title: lit.celebracao, body: lit.reflexao }} />}
      >
        <p>{lit.reflexao}</p>
        <ReviewNote show={lit.revisaoReflexao === 'pendente'} />
      </ReadingCard>

      <Card>
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-dourado-texto">
          <Target aria-hidden className="size-5" /> Propósito do dia
        </p>
        <p className="leitura mt-1">{lit.proposito}</p>
      </Card>

      <nav aria-label="Outros dias" className="flex justify-between gap-2">
        {prev ? (
          <Link to={`/liturgia/${prev.data}`} className="inline-flex min-h-12 items-center gap-1 px-2 font-semibold text-roxo">
            <ChevronLeft aria-hidden className="size-5" /> Dia anterior
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/liturgia/${next.data}`} className="inline-flex min-h-12 items-center gap-1 px-2 font-semibold text-roxo">
            Próximo dia <ChevronRight aria-hidden className="size-5" />
          </Link>
        )}
      </nav>
    </div>
  );
}
