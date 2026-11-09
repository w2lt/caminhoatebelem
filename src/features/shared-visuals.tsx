/** Elementos visuais da identidade: velas da coroa e estrelas da novena. */
import { cx } from '../ui/kit';

const CORES_VELA = ['#60377D', '#60377D', '#D99AB5', '#60377D'];

/** Quatro velas da coroa; acende uma por semana do Advento (decorativo, com rótulo para leitores de tela). */
export function Velas({ acesas, size = 'md', className }: { acesas: number; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dims = { sm: 'h-7 w-2', md: 'h-10 w-2.5', lg: 'h-16 w-4' }[size];
  const flame = { sm: 'h-2.5 w-1.5 -top-3', md: 'h-3 w-2 -top-3.5', lg: 'h-5 w-3 -top-6' }[size];
  return (
    <div className={cx('flex items-end gap-2', className)} role="img" aria-label={acesas === 0 ? 'Nenhuma vela acesa ainda' : `${acesas} de 4 velas da coroa acesas`}>
      {CORES_VELA.map((cor, i) => (
        <span key={i} className={cx('relative rounded-t-[3px] rounded-b-[1px]', dims)} style={{ background: i < acesas ? cor : 'rgb(255 255 255 / 0.14)' }}>
          {i < acesas && <span className={cx('chama absolute left-1/2 -translate-x-1/2', flame)} />}
        </span>
      ))}
    </div>
  );
}

const STAR = 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z';

/** Nove estrelas que se acendem conforme os encontros da novena realizados. */
export function EstrelasNovena({ feitos, total = 9 }: { feitos: number; total?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="img" aria-label={`${feitos} de ${total} encontros realizados`}>
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="size-7" aria-hidden>
          {i < feitos ? <path d={STAR} fill="#D7B15B" /> : <path d={STAR} fill="none" stroke="#A995C8" strokeWidth="1.5" />}
        </svg>
      ))}
    </div>
  );
}
