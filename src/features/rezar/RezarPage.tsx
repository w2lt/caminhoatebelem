import { Link } from 'react-router-dom';
import { BookOpen, Star, HandHeart, Check, ChevronRight } from 'lucide-react';
import { diaPorData } from '../../content';
import { journeyDates, liturgicalDay } from '../../domain/liturgical';
import { addDaysIso, fromIso, tinyDate } from '../../domain/dates';
import { useMarks } from '../../db/progress';
import { useToday } from '../../lib/hooks';
import { MenuLink, PageHeader, cx } from '../../ui/kit';

const LETRA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const DIA_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export function RezarPage() {
  const today = useToday();
  const lit = liturgicalDay(today);
  const datas = journeyDates(lit.cal.anoAdvento);
  const manha = useMarks('manha');
  const noite = useMarks('noite');
  const naJornada = datas.includes(today);
  const foco = naJornada ? today : lit.season === 'tempo-do-natal' ? lit.cal.natal : datas[0]!;
  const diaFoco = diaPorData(foco);
  const rezou = (d: string) => Number(manha?.has(d) ?? 0) + Number(noite?.has(d) ?? 0);

  // Semana (domingo a sábado) que contém o dia em foco.
  const inicioSemana = addDaysIso(foco, -fromIso(foco).getDay());
  const semana = Array.from({ length: 7 }, (_, i) => addDaysIso(inicioSemana, i));

  // Jornada agrupada: 4 semanas do Advento + Natal.
  const grupos: { titulo: string; dias: string[] }[] = [];
  for (const d of datas) {
    const l = liturgicalDay(d);
    const titulo = l.season === 'natal' ? 'Natal do Senhor' : `${l.semana}ª semana do Advento`;
    const g = grupos.at(-1);
    if (g && g.titulo === titulo) g.dias.push(d);
    else grupos.push({ titulo, dias: [d] });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Rezar" subtitle="Orações, liturgia e novena para cada dia do caminho." />

      {diaFoco && (
        <section className="ceu overflow-hidden rounded-3xl p-5 text-creme shadow-[var(--shadow-elevada)]" aria-labelledby="hoje">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-dourado">{naJornada ? 'Hoje' : lit.season === 'tempo-do-natal' ? 'Natal' : 'Primeiro dia da jornada'}</p>
          <h2 id="hoje" className="font-display mt-1 text-[1.875rem] leading-[1.05] text-white">
            {diaFoco.tema}
          </h2>
          <Link to={`/dia/${foco}`} className="mt-4 inline-flex min-h-[3.25rem] items-center gap-2 rounded-full bg-dourado px-5 font-extrabold text-noite">
            {naJornada ? 'Orações de hoje' : 'Orações do 1º dia'} <ChevronRight aria-hidden className="size-5" />
          </Link>

          <ol className="mt-5 grid grid-cols-7 gap-1 rounded-3xl bg-noite/55 p-1 backdrop-blur-[2px]" aria-label="Dias desta semana">
            {semana.map((d) => {
              const na = datas.includes(d);
              const on = d === foco;
              const r = rezou(d);
              // O nome acessível contém o texto visível (WCAG 2.5.3): letra visual oculta, dia por extenso só para leitores de tela.
              const conteudo = (
                <>
                  <span aria-hidden className="text-[0.6875rem] font-bold opacity-80">{LETRA[fromIso(d).getDay()]}</span>
                  <span className="sr-only">{DIA_SEMANA[fromIso(d).getDay()]}, </span>
                  <span className="text-[1.0625rem] font-extrabold tabular-nums">{fromIso(d).getDate()}</span>
                  {r > 0 && <span className="sr-only">, {r} de 2 orações marcadas</span>}
                  <span aria-hidden className={cx('size-1.5 rounded-full', r > 0 ? (on ? 'bg-noite' : 'bg-dourado') : 'bg-transparent')} />
                </>
              );
              return (
                <li key={d}>
                  {na ? (
                    <Link
                      to={`/dia/${d}`}
                      aria-current={d === today ? 'date' : undefined}
                      className={cx('flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-2xl', on ? 'bg-creme text-noite' : 'text-creme hover:bg-white/10')}
                    >
                      {conteudo}
                    </Link>
                  ) : (
                    <span aria-hidden className="flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-2xl text-creme/35">
                      {conteudo}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="grid gap-2">
        <MenuLink to={`/liturgia/${foco}`} icon={BookOpen} title="Liturgia diária" desc="Leituras, salmo e Evangelho do dia" />
        <MenuLink to="/novena" icon={Star} title="Novena de Natal" desc="Do aplicativo ou do seu Círculo Bíblico" tone="verde" />
        <MenuLink to="/rezar/oracoes" icon={HandHeart} title="Orações e cânticos" desc="Orações tradicionais e para ocasiões especiais" tone="rosa" />
      </div>

      <section aria-labelledby="jornada" className="space-y-3">
        <div>
          <h2 id="jornada" className="font-display text-[1.75rem] leading-tight text-roxo">
            A jornada até Belém
          </h2>
          <p className="mt-1 text-tinta-suave">Toque num dia para rezar ou rever. O ✓ mostra as orações que você marcou.</p>
        </div>
        {grupos.map((g) => (
          <div key={g.titulo} className="rounded-3xl bg-papel p-2 shadow-[var(--shadow-suave)]">
            <h3 className="px-3 pb-1 pt-2 text-xs font-extrabold uppercase tracking-[0.14em] text-dourado-texto">{g.titulo}</h3>
            <ol>
              {g.dias.map((data) => {
                const d = diaPorData(data);
                const isHoje = data === today;
                const futuro = data > today;
                const r = rezou(data);
                const n = datas.indexOf(data) + 1;
                return (
                  <li key={data}>
                    <Link
                      to={`/dia/${data}`}
                      aria-current={isHoje ? 'date' : undefined}
                      className={cx('flex min-h-[3.75rem] items-center gap-3 rounded-2xl px-3 py-2', isHoje ? 'bg-lavanda-claro' : 'hover:bg-creme')}
                    >
                      <span className={cx('grid size-10 shrink-0 place-items-center rounded-full text-sm font-extrabold tabular-nums', futuro ? 'bg-creme text-tinta-suave' : 'bg-roxo text-white')}>{n}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-tinta-suave">
                          {tinyDate(data)}
                          {isHoje && ' · hoje'}
                        </span>
                        <span className="block font-bold leading-snug">{d?.tema ?? 'Conteúdo em preparação'}</span>
                      </span>
                      {r > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-verde-claro px-2 py-1 text-sm font-extrabold text-verde">
                          <Check aria-hidden className="size-4" strokeWidth={3} />
                          {r}/2<span className="sr-only"> orações marcadas</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </section>
    </div>
  );
}
