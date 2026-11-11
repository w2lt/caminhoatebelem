import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, ExternalLink as ExtIcon, Info, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { fontesOficiais, liturgiaPorData } from '../../content';
import { CORES_LITURGICAS } from '../../content/tradicoes';
import { addDaysIso, isValidIso, longDate, todayIso } from '../../domain/dates';
import { liturgicalDay } from '../../domain/liturgical';
import { useOnline } from '../../lib/hooks';
import { Badge, Card, EmptyState, ExternalLink, PageHeader, ReviewNote } from '../../ui/kit';
import { FontSizeControl, ReadingCard, ShareButton } from '../../ui/reading';

/** Tom suave da cor litúrgica usado como fundo do cartão da celebração. */
const TINTA: Record<string, string> = { roxo: '#efe9f6', rosa: '#f8e9ef', branco: '#f6edd6', vermelho: '#f6e2e2', verde: '#e4ede7' };

const dot = 'absolute -left-[1.3rem] top-3.5 size-2.5 rounded-full bg-papel ring-2 ring-lavanda';
const rotulo = 'text-xs font-extrabold uppercase tracking-[0.12em] text-tinta-suave';

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
  const fontes = fontesOficiais(lit.data);

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Liturgia diária" title={longDate(lit.data).replace(/ de \d{4}$/, '')} back="/rezar" actions={<FontSizeControl />} />

      <section
        className="rounded-3xl p-5 shadow-[var(--shadow-suave)]"
        style={{ background: `linear-gradient(135deg, ${TINTA[lit.cor] ?? '#efe9f6'}, var(--color-papel) 72%)` }}
        aria-labelledby="celebracao"
      >
        <h2 id="celebracao" className="font-display text-[1.875rem] leading-[1.08]">
          {lit.celebracao}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-papel px-3 py-0.5 text-sm font-extrabold shadow-[var(--shadow-suave)]">
            <span aria-hidden className="size-3.5 rounded-full ring-1 ring-black/15" style={{ background: cor.hex }} />
            Cor litúrgica: {cor.nome}
          </span>
          <Badge>{lit.grau}</Badge>
          {ld.season === 'advento' && <Badge tone="cinza">Ano {ld.cal.ciclo}</Badge>}
        </div>
        <p className="mt-3 text-tinta-suave">{cor.sentido}</p>
        {lit.observacao && (
          <p className="mt-2 flex gap-2 text-tinta-suave">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0" /> {lit.observacao}
          </p>
        )}
      </section>

      {lit.missas.map((m, i) => (
        <section key={i} aria-labelledby={`missa-${i}`} className="rounded-3xl bg-papel p-5 shadow-[var(--shadow-suave)]">
          <h2 id={`missa-${i}`} className="font-display text-[1.625rem] leading-tight text-roxo">
            {m.nome ?? 'Leituras da Missa'}
          </h2>
          <ol className="relative mt-3 grid gap-1 pl-6 before:absolute before:bottom-24 before:left-[0.45rem] before:top-4 before:w-[1.5px] before:bg-lavanda-claro">
            {m.leituras.map((l) => {
              const ev = l.tipo === 'Evangelho';
              const semAclamacao = ev && !m.leituras.some((x) => x.tipo === 'Aclamação ao Evangelho');
              return (
                <Fragment key={l.tipo + l.referencia}>
                  {semAclamacao && (
                    <li className="relative py-2">
                      <span aria-hidden className={dot} />
                      <p className={rotulo}>Aclamação ao Evangelho</p>
                      <p className="text-tinta-suave">Conforme o Lecionário — veja na fonte oficial.</p>
                    </li>
                  )}
                  {ev ? (
                    <li className="relative -ml-6 mt-2">
                      <div className="ceu rounded-3xl p-5 text-creme">
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-dourado">Evangelho</p>
                        <p className="font-display mt-1 text-[1.875rem] leading-tight text-white">{l.referencia}</p>
                        {l.alternativa && <p className="text-creme">{l.alternativa}</p>}
                        {l.textoIntegral && (
                          <p className="leitura mt-2">
                            {l.textoIntegral.texto}
                            <span className="mt-1 block font-sans text-xs">
                              Fonte: {l.textoIntegral.fonte} · {l.textoIntegral.licenca}
                            </span>
                          </p>
                        )}
                        <a
                          href={fontes[0]!.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 font-bold text-creme ring-1 ring-white/25"
                        >
                          Ler as leituras completas <ExtIcon aria-hidden className="size-4" />
                          <span className="sr-only"> (abre o site da Canção Nova, requer internet)</span>
                        </a>
                        <p className="mt-2 text-sm text-creme/80">
                          {lit.data === todayIso()
                            ? 'Abre no site da Canção Nova, nas leituras de hoje.'
                            : 'Abre no site da Canção Nova, nas leituras de hoje. Para este dia, escolha a data no calendário do site.'}
                        </p>
                      </div>
                    </li>
                  ) : (
                    <li className="relative py-2">
                      <span aria-hidden className={dot} />
                      <p className={rotulo}>{l.tipo}</p>
                      <p className="text-[1.1875rem] font-extrabold">{l.referencia}</p>
                      {l.alternativa && <p className="text-tinta-suave">{l.alternativa}</p>}
                      {l.textoIntegral && (
                        <p className="leitura mt-1">
                          {l.textoIntegral.texto}
                          <span className="mt-1 block font-sans text-xs text-tinta-suave">
                            Fonte: {l.textoIntegral.fonte} · {l.textoIntegral.licenca}
                          </span>
                        </p>
                      )}
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ol>
        </section>
      ))}

      <ReadingCard
        kicker="Reflexão sobre o Evangelho"
        tone="verde"
        actions={<ShareButton title="Reflexão sobre o Evangelho" text={lit.reflexao} card={{ kicker: 'Reflexão do Evangelho', title: lit.celebracao, body: lit.reflexao }} />}
      >
        <p>{lit.reflexao}</p>
        <ReviewNote show={lit.revisaoReflexao === 'pendente'} />
      </ReadingCard>

      <section className="rounded-3xl bg-dourado-claro p-5" aria-labelledby="proposito">
        <h2 id="proposito" className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-dourado-texto">
          <Target aria-hidden className="size-4" /> Propósito do dia
        </h2>
        <p className="leitura mt-2">{lit.proposito}</p>
      </section>

      <Card aria-labelledby="fontes">
        <h2 id="fontes" className="flex items-center gap-2 font-extrabold">
          <ExtIcon aria-hidden className="size-5 text-roxo" /> Ler os textos completos
        </h2>
        <p className="mt-1 text-tinta-suave">
          Os textos bíblicos e litúrgicos oficiais têm direitos autorais e não são reproduzidos no app. Leia na sua Bíblia pelas referências acima ou nas fontes abaixo
          {online ? '.' : ' (é preciso estar conectado à internet).'}
        </p>
        <ul className="mt-3 space-y-2">
          {fontes.map((f) => (
            <li key={f.url}>
              <ExternalLink href={f.url}>{f.nome}</ExternalLink>
            </li>
          ))}
        </ul>
        {pendente && <p className="mt-3 text-xs text-tinta-suave">Referências conforme o Lecionário Romano, em conferência editorial com o Diretório Litúrgico da CNBB.</p>}
      </Card>

      <nav aria-label="Outros dias" className="flex flex-wrap justify-between gap-2">
        {prev ? (
          <Link to={`/liturgia/${prev.data}`} className="inline-flex min-h-12 items-center gap-1 rounded-full bg-papel pl-2 pr-4 font-bold text-roxo shadow-[var(--shadow-suave)]">
            <ChevronLeft aria-hidden className="size-5" /> Dia anterior
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/liturgia/${next.data}`} className="inline-flex min-h-12 items-center gap-1 rounded-full bg-papel pl-4 pr-2 font-bold text-roxo shadow-[var(--shadow-suave)]">
            Próximo dia <ChevronRight aria-hidden className="size-5" />
          </Link>
        )}
      </nav>
    </div>
  );
}
