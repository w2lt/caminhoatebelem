/** Componentes básicos reutilizáveis e acessíveis (alvos de toque ≥ 48px, foco visível, labels). */
import { forwardRef, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

type Variant = 'primario' | 'secundario' | 'suave' | 'perigo';
const variants: Record<Variant, string> = {
  primario: 'bg-roxo text-white hover:bg-roxo-escuro',
  secundario: 'bg-papel text-roxo border-2 border-roxo hover:bg-roxo-claro',
  suave: 'bg-roxo-claro text-roxo hover:bg-[#e3d4ec]',
  perigo: 'bg-erro text-white hover:bg-[#861d21]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: LucideIcon; full?: boolean }>(
  function Button({ variant = 'primario', icon: Icon, full, className, children, type = 'button', ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cx(
          'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-2 text-base font-semibold transition-colors disabled:opacity-50',
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
    <As className={cx('rounded-2xl border border-borda bg-papel p-4 shadow-[0_1px_2px_rgba(60,40,70,0.06)]', className)} {...rest}>
      {children}
    </As>
  );
}

/** Linha de menu grande (ícone + título + descrição), usada em "Mais" e na tela inicial. */
export function MenuLink({ to, icon: Icon, title, desc, tone = 'roxo' }: { to: string; icon: LucideIcon; title: string; desc?: string; tone?: 'roxo' | 'verde' | 'rosa' | 'dourado' }) {
  const tones = {
    roxo: 'bg-roxo-claro text-roxo',
    verde: 'bg-verde-claro text-verde',
    rosa: 'bg-rosa-claro text-rosa-texto',
    dourado: 'bg-dourado-claro text-dourado-texto',
  };
  return (
    <Link to={to} className="flex min-h-16 items-center gap-3 rounded-2xl border border-borda bg-papel p-3 hover:border-roxo">
      <span className={cx('grid size-11 shrink-0 place-items-center rounded-xl', tones[tone])}>
        <Icon aria-hidden className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-tinta">{title}</span>
        {desc && <span className="block text-sm text-tinta-suave">{desc}</span>}
      </span>
      <ChevronRight aria-hidden className="size-5 text-tinta-suave" />
    </Link>
  );
}

export function PageHeader({ title, subtitle, back, actions }: { title: string; subtitle?: string; back?: string; actions?: ReactNode }) {
  return (
    <header className="mb-4">
      {back && (
        <Link to={back} className="-ml-2 mb-1 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-roxo">
          <ChevronLeft aria-hidden className="size-5" /> Voltar
        </Link>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-bold leading-tight text-roxo">{title}</h1>
          {subtitle && <p className="mt-1 text-tinta-suave">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </header>
  );
}

export function Badge({ children, tone = 'roxo' }: { children: ReactNode; tone?: 'roxo' | 'verde' | 'rosa' | 'dourado' | 'cinza' }) {
  const tones = {
    roxo: 'bg-roxo-claro text-roxo',
    verde: 'bg-verde-claro text-verde',
    rosa: 'bg-rosa-claro text-rosa-texto',
    dourado: 'bg-dourado-claro text-dourado-texto',
    cinza: 'bg-[#eee8f0] text-tinta-suave',
  };
  return <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium', tones[tone])}>{children}</span>;
}

/** Aviso discreto de conteúdo autoral ainda não aprovado pela revisão editorial. */
export function ReviewNote({ show }: { show: boolean }) {
  if (!show) return null;
  return <p className="mt-3 text-xs text-tinta-suave">Texto autoral do Caminho até Belém · em revisão editorial.</p>;
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
}

export function TextField({ label, hint, error, className, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined}
        className={cx('min-h-12 w-full rounded-xl border-2 bg-white px-3 text-base', error ? 'border-erro' : 'border-borda focus:border-roxo')}
        {...rest}
      />
      {hint && !error && <p id={`${id}-h`} className="mt-1 text-sm text-tinta-suave">{hint}</p>}
      {error && <p id={`${id}-e`} className="mt-1 text-sm font-medium text-erro" role="alert">{error}</p>}
    </div>
  );
}

export function TextArea({ label, hint, error, className, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block font-semibold">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined}
        className={cx('w-full rounded-xl border-2 bg-white px-3 py-2 text-base', error ? 'border-erro' : 'border-borda focus:border-roxo')}
        {...rest}
      />
      {hint && !error && <p id={`${id}-h`} className="mt-1 text-sm text-tinta-suave">{hint}</p>}
      {error && <p id={`${id}-e`} className="mt-1 text-sm font-medium text-erro" role="alert">{error}</p>}
    </div>
  );
}

export function SelectField({ label, hint, error, className, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block font-semibold">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={!!error || undefined}
        className={cx('min-h-12 w-full rounded-xl border-2 bg-white px-3 text-base', error ? 'border-erro' : 'border-borda focus:border-roxo')}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && <p className="mt-1 text-sm text-tinta-suave">{hint}</p>}
      {error && <p className="mt-1 text-sm font-medium text-erro" role="alert">{error}</p>}
    </div>
  );
}

export function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex min-h-12 items-center justify-between gap-3">
      <label htmlFor={id} className="min-w-0 flex-1">
        <span className="block font-semibold">{label}</span>
        {desc && <span className="block text-sm text-tinta-suave">{desc}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx('relative h-8 w-14 shrink-0 rounded-full transition-colors', checked ? 'bg-verde' : 'bg-[#b9adbf]')}
      >
        <span className={cx('absolute top-1 size-6 rounded-full bg-white shadow transition-all', checked ? 'left-7' : 'left-1')} />
      </button>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-borda p-6 text-center">
      <Icon aria-hidden className="mx-auto mb-2 size-10 text-roxo" />
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-2 text-tinta-suave">{children}</div>}
    </div>
  );
}

/** Link externo seguro (sempre nova aba, sem referrer). */
export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cx('font-semibold text-roxo underline underline-offset-2', className)}>
      {children}
      <span className="sr-only"> (abre fora do app, requer internet)</span>
    </a>
  );
}
