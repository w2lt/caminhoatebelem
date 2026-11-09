/** Blocos de leitura: ajuste de fonte durante a leitura, marcação e compartilhamento. */
import { useState, type ReactNode } from 'react';
import { AArrowDown, AArrowUp, Check, Share2 } from 'lucide-react';
import { setSetting, useSettings } from '../db/settings';
import type { FontSize } from '../db/database';
import { cx } from './kit';
import { ShareDialog } from './dialogs';
import type { CardContent } from '../services/cards';

const ORDER: FontSize[] = ['normal', 'grande', 'extra'];
export const FONT_LABEL: Record<FontSize, string> = { normal: 'Normal', grande: 'Grande', extra: 'Extra grande' };

const roundBtn = 'grid size-11 place-items-center rounded-full bg-papel text-tinta shadow-[var(--shadow-suave)] disabled:opacity-40';

/** Botões A− / A+ para mudar o tamanho do texto sem sair da leitura. */
export function FontSizeControl() {
  const s = useSettings();
  const current = s?.fontSize ?? 'normal';
  const i = ORDER.indexOf(current);
  return (
    <div className="flex items-center gap-2" role="group" aria-label={`Tamanho do texto: ${FONT_LABEL[current]}`}>
      <button type="button" className={roundBtn} onClick={() => setSetting('fontSize', ORDER[i - 1]!)} disabled={i === 0} aria-label="Diminuir o texto">
        <AArrowDown aria-hidden className="size-5" />
      </button>
      <button type="button" className={roundBtn} onClick={() => setSetting('fontSize', ORDER[i + 1]!)} disabled={i === ORDER.length - 1} aria-label="Aumentar o texto">
        <AArrowUp aria-hidden className="size-6" />
      </button>
    </div>
  );
}

export function ShareButton({ title, text, card, label = 'Compartilhar' }: { title: string; text: string; card?: CardContent; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-papel px-4 font-bold text-roxo ring-[1.5px] ring-inset ring-lavanda hover:bg-lavanda-claro"
      >
        <Share2 aria-hidden className="size-5" /> {label}
      </button>
      <ShareDialog open={open} onOpenChange={setOpen} title={title} text={text} card={card} />
    </>
  );
}

/** Marcação opcional ("Rezei", "Feito"): pílula que fica verde-oliva quando marcada. */
export function DoneToggle({ done, onToggle, label, doneLabel }: { done: boolean; onToggle: () => void; label: string; doneLabel: string }) {
  return (
    <button
      type="button"
      aria-pressed={done}
      onClick={onToggle}
      className={cx(
        'inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-bold transition-colors',
        done ? 'bg-verde text-white' : 'bg-verde-claro text-verde hover:bg-[#d6e5db]',
      )}
    >
      <span className={cx('grid size-6 place-items-center rounded-full', done ? 'bg-white/20' : 'bg-white ring-[1.5px] ring-inset ring-verde')}>
        <Check aria-hidden className={cx('size-4', done ? 'surgir' : 'opacity-0')} strokeWidth={3} />
      </span>
      {done ? doneLabel : label}
    </button>
  );
}

/** Um texto de oração/reflexão com cabeçalho, corpo em Literata e ações. */
export function ReadingCard({ id, icon, kicker, title, children, actions, tone = 'roxo' }: { id?: string; icon?: ReactNode; kicker: string; title?: string; children: ReactNode; actions?: ReactNode; tone?: 'roxo' | 'dourado' | 'verde' | 'rosa' }) {
  const tones = { roxo: 'text-lavanda-texto', dourado: 'text-dourado-texto', verde: 'text-verde', rosa: 'text-rosa-texto' };
  return (
    <article className="scroll-mt-4 rounded-3xl bg-papel p-5 shadow-[var(--shadow-suave)]" aria-labelledby={id}>
      <p className={cx('flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em]', tones[tone])}>
        {icon}
        {kicker}
      </p>
      {title && (
        <h2 id={id} className="font-display mt-2 text-[1.75rem] leading-[1.1] text-tinta">
          {title}
        </h2>
      )}
      <div className="leitura mt-3">{children}</div>
      {actions && <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>}
    </article>
  );
}
