/**
 * Componentes básicos reutilizáveis e acessíveis — identidade "vigília luminosa".
 * Alvos de toque ≥ 48 px (botões 52 px), foco visível, rótulos sempre visíveis.
 */
import { forwardRef, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

type Variant = 'primario' | 'secundario' | 'suave' | 'perigo' | 'confirmar';
const variants: Record<Variant, string> = {
  primario: 'bg-roxo text-white shadow-[0_6px_16px_rgb(96_55_125/0.28)] hover:bg-roxo-escuro',
  secundario: 'bg-papel text-roxo ring-[1.5px] ring-inset ring-lavanda hover:bg-lavanda-claro',
  suave: 'bg-lavanda-claro text-lavanda-texto hover:bg-[#e4dcf1]',
  perigo: 'bg-erro text-white hover:bg-[#861d21]',
  confirmar: 'bg-verde text-white hover:bg-[#3b5c49]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: LucideIcon; full?: boolean }>(
  function Button({ variant = 'primario', icon: Icon, full, className, children, type = 'button', ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cx(
          'inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-full px-5 py-2 text-base font-bold transition-[background-color,transform] active:scale-[0.98] disabled:opacity-50',
          variants[variant],
          full && 'w-full',
          className,
        )}
        {...rest}
      >
        {Icon && <Icon aria-hidden className="size-5 shrink-0" />}
        {children}
      </button>
    );
  },
);

export function Card({ children, className, as: As = 'section', ...rest }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article' | 'li'; 'aria-labelledby'?: string }) {
  return (
    <As className={cx('rounded-3xl bg-papel p-5 shadow-[var(--shadow-suave)]', className)} {...rest}>
      {children}
    </As>
  );
}

const tones = {
  roxo: 'bg-lavanda-claro text-roxo',
  verde: 'bg-verde-claro text-verde',
  rosa: 'bg-rosa-claro text-rosa-texto',
  dourado: 'bg-dourado-claro text-dourado-texto',
};

/** Linha de menu grande (ícone + título + descrição), usada em "Mais" e nas listas de atalhos. */
export function MenuLink({ to, icon: Icon, title, desc, tone = 'roxo' }: { to: string; icon: LucideIcon; title: string; desc?: string; tone?: keyof typeof tones }) {
  return (
    <Link to={to} className="group flex min-h-[4.25rem] w-full min-w-0 items-center gap-4 rounded-3xl bg-papel p-3.5 pr-4 shadow-[var(--shadow-suave)] transition-transform active:scale-[0.99]">
      <span className={cx('grid size-12 shrink-0 place-items-center rounded-2xl', tones[tone])}>
        <Icon aria-hidden className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[1.0625rem] font-bold text-tinta [overflow-wrap:anywhere]">{title}</span>
        {desc && <span className="block text-sm text-tinta-suave [overflow-wrap:anywhere]">{desc}</span>}
      </span>
      <ChevronRight aria-hidden className="size-5 text-lavanda transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Cabeçalho das telas internas: botão Voltar em pílula, sobretítulo dourado, título em Cormorant. */
export function PageHeader({ title, subtitle, back, actions, eyebrow, art }: { title: string; subtitle?: string; back?: string; actions?: ReactNode; eyebrow?: string; art?: string }) {
  return (
    <header className="mb-5">
      {(back || actions) && (
        <div className="mb-3 flex min-h-11 flex-wrap items-center justify-between gap-3">
          {back ? (
            <Link to={back} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-papel pl-2 pr-4 font-bold text-roxo shadow-[var(--shadow-suave)]">
              <ChevronLeft aria-hidden className="size-5" /> Voltar
            </Link>
          ) : (
            <span />
          )}
          {actions}
        </div>
      )}
      <div className="flex items-end gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.14em] text-dourado-texto">{eyebrow}</p>}
          <h1 className="font-display text-[2.125rem] leading-[1.05] text-roxo [overflow-wrap:anywhere]">{title}</h1>
          {subtitle && <p className="mt-2 text-tinta-suave">{subtitle}</p>}
        </div>
        {art && <img src={art} alt="" className="size-24 shrink-0 rounded-3xl object-cover shadow-[var(--shadow-suave)]" />}
      </div>
    </header>
  );
}

/** Sobretítulo de seção (pequeno, caixa-alta, espaçado). */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('text-xs font-extrabold uppercase tracking-[0.14em] text-dourado-texto', className)}>{children}</p>;
}

export function Badge({ children, tone = 'roxo' }: { children: ReactNode; tone?: 'roxo' | 'verde' | 'rosa' | 'dourado' | 'cinza' }) {
  const t = { ...tones, cinza: 'bg-[#efeaf1] text-tinta-suave' };
  return <span className={cx('inline-flex items-center rounded-full px-3 py-0.5 text-sm font-bold', t[tone])}>{children}</span>;
}

/** Aviso discreto de conteúdo autoral ainda não aprovado pela revisão editorial. */
export function ReviewNote({ show }: { show: boolean }) {
  if (!show) return null;
  return <p className="mt-3 text-center text-xs text-tinta-suave">Texto autoral do Caminho até Belém · em revisão editorial.</p>;
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
}

const fieldBase = 'w-full rounded-2xl bg-white px-4 text-base text-tinta ring-[1.5px] ring-inset transition-shadow focus:outline-none focus:ring-2 focus:ring-roxo focus:shadow-[0_0_0_4px_rgb(169_149_200/0.35)]';

export function TextField({ label, hint, error, className, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-bold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined}
        className={cx(fieldBase, 'min-h-[3.25rem]', error ? 'ring-erro' : 'ring-[#dccfe6]')}
        {...rest}
      />
      {hint && !error && <p id={`${id}-h`} className="mt-1.5 text-sm text-tinta-suave">{hint}</p>}
      {error && <p id={`${id}-e`} className="mt-1.5 text-sm font-bold text-erro" role="alert">{error}</p>}
    </div>
  );
}

export function TextArea({ label, hint, error, className, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-bold">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined}
        className={cx(fieldBase, 'py-3', error ? 'ring-erro' : 'ring-[#dccfe6]')}
        {...rest}
      />
      {hint && !error && <p id={`${id}-h`} className="mt-1.5 text-sm text-tinta-suave">{hint}</p>}
      {error && <p id={`${id}-e`} className="mt-1.5 text-sm font-bold text-erro" role="alert">{error}</p>}
    </div>
  );
}

export function SelectField({ label, hint, error, className, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-bold">
        {label}
      </label>
      <select id={id} aria-invalid={!!error || undefined} className={cx(fieldBase, 'min-h-[3.25rem]', error ? 'ring-erro' : 'ring-[#dccfe6]')} {...rest}>
        {children}
      </select>
      {hint && !error && <p className="mt-1.5 text-sm text-tinta-suave">{hint}</p>}
      {error && <p className="mt-1.5 text-sm font-bold text-erro" role="alert">{error}</p>}
    </div>
  );
}

export function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex min-h-12 items-center justify-between gap-3">
      <label htmlFor={id} className="min-w-0 flex-1">
        <span className="block font-bold">{label}</span>
        {desc && <span className="block text-sm text-tinta-suave [overflow-wrap:anywhere]">{desc}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx('relative h-8 w-14 shrink-0 rounded-full transition-colors', checked ? 'bg-verde' : 'bg-[#b9adc4]')}
      >
        <span className={cx('absolute top-1 size-6 rounded-full bg-white shadow transition-all', checked ? 'left-7' : 'left-1')} />
      </button>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, art }: { icon: LucideIcon; title: string; children?: ReactNode; art?: string }) {
  return (
    <div className="rounded-3xl bg-papel p-6 text-center shadow-[var(--shadow-suave)]">
      {art ? (
        <img src={art} alt="" className="mx-auto mb-2 size-28 rounded-2xl object-cover" />
      ) : (
        <span className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-lavanda-claro text-roxo">
          <Icon aria-hidden className="size-7" />
        </span>
      )}
      <p className="font-display text-2xl text-tinta">{title}</p>
      {children && <div className="mt-2 text-tinta-suave">{children}</div>}
    </div>
  );
}

/** Link externo seguro (sempre nova aba, sem referrer). */
export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cx('font-bold text-roxo underline decoration-lavanda decoration-2 underline-offset-4', className)}>
      {children}
      <span className="sr-only"> (abre fora do app, requer internet)</span>
    </a>
  );
}
