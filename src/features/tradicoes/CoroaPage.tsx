import { Flame } from 'lucide-react';
import { coroa } from '../../content/tradicoes';
import { liturgicalDay } from '../../domain/liturgical';
import { longDate } from '../../domain/dates';
import { useToday } from '../../lib/hooks';
import { Card, PageHeader, ReviewNote, cx } from '../../ui/kit';
import { FontSizeControl, ReadingCard, ShareButton } from '../../ui/reading';

const VELA: Record<number, string> = { 1: '#60377D', 2: '#60377D', 3: '#D99AB5', 4: '#60377D' };

export function CoroaPage() {
  const today = useToday();
  const lit = liturgicalDay(today);
  const acesas = lit.season === 'advento' ? lit.semana ?? 0 : lit.season === 'antes-do-advento' ? 0 : 4;

  return (
    <div className="space-y-4">
      <PageHeader title="Coroa do Advento" subtitle="Significado, cores e orações dos domingos." back="/mais" actions={<FontSizeControl />} />

      <Card className="text-center">
        <div className="flex items-end justify-center gap-4" role="img" aria-label={`${acesas} de 4 velas acesas nesta semana`}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex flex-col items-center">
              <Flame aria-hidden className={cx('size-7', n <= acesas ? 'text-dourado' : 'text-transparent')} />
              <div className="h-16 w-5 rounded-t-md" style={{ background: VELA[n] }} />
            </div>
          ))}
        </div>
        <div className="mx-auto -mt-1 h-4 w-48 rounded-full bg-verde" aria-hidden />
        <p className="mt-2 text-tinta-suave">{acesas === 0 ? 'Nenhuma vela acesa ainda.' : `${acesas} vela${acesas > 1 ? 's' : ''} acesa${acesas > 1 ? 's' : ''} nesta semana.`}</p>
      </Card>

      {coroa.secoes.map((s) => (
        <ReadingCard key={s.titulo} kicker={s.titulo}>
          <p>{s.texto}</p>
        </ReadingCard>
      ))}

      <Card aria-labelledby="cores">
        <h2 id="cores" className="font-serif text-lg font-bold text-roxo">
          Cores litúrgicas e cores das velas
        </h2>
        <h3 className="mt-2 font-semibold">Cores litúrgicas (normas da Igreja)</h3>
        <p className="leitura">{coroa.cores.liturgicas}</p>
        <ul className="mt-2 grid gap-1">
          {coroa.domingos.map((d) => (
            <li key={d.domingo} className="flex items-center gap-2">
              <span aria-hidden className="inline-block size-4 rounded-full" style={{ background: VELA[d.domingo] }} />
              {d.domingo}º Domingo: {d.cor}
            </li>
          ))}
        </ul>
        <h3 className="mt-3 font-semibold">Cores das velas (tradição local)</h3>
        <p className="leitura">{coroa.cores.velas}</p>
      </Card>

      <h2 className="font-serif text-xl font-bold text-roxo">Orações dos domingos</h2>
      {coroa.domingos.map((d) => {
        const data = lit.cal.domingos[d.domingo - 1]!;
        return (
          <ReadingCard
            key={d.domingo}
            kicker={`${d.domingo}º Domingo · ${longDate(data).split(', ')[1]}`}
            title={`Acendimento da ${d.domingo}ª vela`}
            tone={d.domingo === 3 ? 'rosa' : 'roxo'}
            actions={<ShareButton title={`Oração da ${d.domingo}ª vela`} text={d.oracao} card={{ kicker: `${d.domingo}º Domingo do Advento`, title: `Acendimento da ${d.domingo}ª vela`, body: d.oracao }} />}
          >
            <p>{d.oracao}</p>
          </ReadingCard>
        );
      })}
      <ReviewNote show />
    </div>
  );
}
