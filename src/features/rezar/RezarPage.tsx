import { Link } from 'react-router-dom';
import { BookOpen, Star, HandHeart, Check, Sun } from 'lucide-react';
import { diaPorData } from '../../content';
import { journeyDates, liturgicalDay } from '../../domain/liturgical';
import { tinyDate } from '../../domain/dates';
import { useMarks } from '../../db/progress';
import { useToday } from '../../lib/hooks';
import { MenuLink, PageHeader, cx } from '../../ui/kit';

export function RezarPage() {
  const today = useToday();
  const lit = liturgicalDay(today);
  const datas = journeyDates(lit.cal.anoAdvento);
  const manha = useMarks('manha');
  const noite = useMarks('noite');
  const hojeNaJornada = datas.includes(today) ? today : lit.season === 'tempo-do-natal' ? lit.cal.natal : datas[0]!;

  return (
    <div>
      <PageHeader title="Rezar" subtitle="Orações, liturgia e novena para cada dia do caminho." />
      <div className="grid gap-2">
        <MenuLink to={`/dia/${hojeNaJornada}`} icon={Sun} title={datas.includes(today) ? 'Orações de hoje' : 'Orações do 1º dia'} desc="Manhã, noite, reflexão, frase e gesto" tone="dourado" />
        <MenuLink to={`/liturgia/${hojeNaJornada}`} icon={BookOpen} title="Liturgia diária" desc="Leituras, salmo e Evangelho do dia" />
        <MenuLink to="/novena" icon={Star} title="Novena de Natal" desc="Do aplicativo ou do seu Círculo Bíblico" tone="verde" />
        <MenuLink to="/rezar/oracoes" icon={HandHeart} title="Orações e cânticos" desc="Orações tradicionais e para ocasiões especiais" tone="rosa" />
      </div>

      <h2 className="mb-2 mt-6 font-serif text-xl font-bold text-roxo">Todos os dias da jornada</h2>
      <p className="mb-3 text-tinta-suave">Toque num dia para rezar ou rever. O sinal ✓ mostra as orações que você marcou.</p>
      <ol className="grid gap-2">
        {datas.map((data, i) => {
          const d = diaPorData(data);
          const isHoje = data === today;
          const futuro = data > today;
          const feitos = Number(manha?.has(data) ?? 0) + Number(noite?.has(data) ?? 0);
          return (
            <li key={data}>
              <Link
                to={`/dia/${data}`}
                aria-current={isHoje ? 'date' : undefined}
                className={cx('flex min-h-14 items-center gap-3 rounded-2xl border p-3 hover:border-roxo', isHoje ? 'border-2 border-roxo bg-roxo-claro' : 'border-borda bg-papel')}
              >
                <span className={cx('grid size-10 shrink-0 place-items-center rounded-full font-bold', futuro ? 'bg-[#eee8f0] text-tinta-suave' : 'bg-roxo text-white')}>{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-tinta-suave">
                    {tinyDate(data)}
                    {isHoje && ' · hoje'}
                  </span>
                  <span className="block font-semibold">{d?.tema ?? 'Conteúdo em preparação'}</span>
                </span>
                {feitos > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-verde" aria-label={`${feitos} de 2 orações marcadas`}>
                    <Check aria-hidden className="size-5" />
                    {feitos}/2
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
