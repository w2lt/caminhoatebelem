/** Blocos de leitura: ajuste de fonte durante a leitura, marcação e compartilhamento. */
import { useState, type ReactNode } from 'react';
import { AArrowDown, AArrowUp, Check, Share2 } from 'lucide-react';
import { setSetting, useSettings } from '../db/settings';
import type { FontSize } from '../db/database';
import { Card, cx } from './kit';
import { ShareDialog } from './dialogs';
import type { CardContent } from '../services/cards';

const ORDER: FontSize[] = ['normal', 'grande', 'extra'];
export const FONT_LABEL: Record<FontSize, string> = { normal: 'Normal', grande: 'Grande', extra: 'Extra grande' };

/** Botões A− / A+ para mudar o tamanho do texto sem sair da leitura. */
export function FontSizeControl() {
  const s = useSettings();
  const current = s?.fontSize ?? 'normal';
  const i = ORDER.indexOf(current);
  return (
    <div className="flex items-center gap-1" role="group" aria-label={`Tamanho do texto: ${FONT_LABEL[current]}`}>
      <button
        type="button"
        className="grid size-11 place-items-center rounded-full border border-borda bg-papel disabled:opacity-40"
        onClick={() => setSetting('fontSize', ORDER[i - 1]!)}
        disabled={i === 0}
        aria-label="Diminuir o texto"
      >
        <AArrowDown aria-hidden className="size-5" />
      </button>
      <button
        type="button"
        className="grid size-11 place-items-center rounded-full border border-borda bg-papel disabled:opacity-40"
        onClick={() => setSetting('fontSize', ORDER[i + 1]!)}
        disabled={i === ORDER.length - 1}
        aria-label="Aumentar o texto"
      >
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
        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 font-semibold text-roxo hover:bg-roxo-claro"
      >
        <Share2 aria-hidden className="size-5" /> {label}
      </button>
      <ShareDialog open={open} onOpenChange={setOpen} title={title} text={text} card={card} />
    </>
  );
}

export function DoneToggle({ done, onToggle, label, doneLabel }: { done: boolean; onToggle: () => void; label: string; doneLabel: string }) {
  return (
    <button
      type="button"
      aria-pressed={done}
      onClick={onToggle}
      className={cx(
        'inline-flex min-h-11 items-center gap-2 rounded-xl border-2 px-3 font-semibold',
        done ? 'border-verde bg-verde text-white' : 'border-verde bg-papel text-verde',
      )}
    >
      <Check aria-hidden className="size-5" /> {done ? doneLabel : label}
    </button>
  );
}

/** Um texto de oração/reflexão com cabeçalho, corpo serifado e ações. */
export function ReadingCard({ id, icon, kicker, title, children, actions, tone = 'roxo' }: { id?: string; icon?: ReactNode; kicker: string; title?: string; children: ReactNode; actions?: ReactNode; tone?: 'roxo' | 'dourado' | 'verde' | 'rosa' }) {
  const tones = { roxo: 'text-roxo', dourado: 'text-dourado-texto', verde: 'text-verde', rosa: 'text-rosa-texto' };
  return (
    <Card as="article" className="scroll-mt-4" aria-labelledby={id}>
      <p className={cx('flex items-center gap-2 text-sm font-bold uppercase tracking-wide', tones[tone])}>
        {icon}
        {kicker}
      </p>
      {title && (
        <h2 id={id} className="mt-1 font-serif text-xl font-bold text-tinta">
          {title}
        </h2>
      )}
      <div className="leitura mt-2">{children}</div>
      {actions && <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-borda pt-3">{actions}</div>}
    </Card>
  );
}
