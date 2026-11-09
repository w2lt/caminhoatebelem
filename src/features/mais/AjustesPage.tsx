import { setSetting, useSettings } from '../../db/settings';
import type { FontSize } from '../../db/database';
import { Card, PageHeader, Toggle, cx } from '../../ui/kit';
import { FONT_LABEL } from '../../ui/reading';

const SIZES: FontSize[] = ['normal', 'grande', 'extra'];
const PX: Record<FontSize, string> = { normal: 'text-base', grande: 'text-xl', extra: 'text-2xl' };

export function AjustesPage() {
  const s = useSettings();
  if (!s) return <PageHeader title="Aparência" back="/mais" />;
  return (
    <div className="space-y-4">
      <PageHeader title="Tamanho do texto e contraste" back="/mais" />
      <Card>
        <fieldset>
          <legend className="font-semibold">Tamanho do texto</legend>
          <p className="text-sm text-tinta-suave">Você também pode mudar durante a leitura, pelos botões A− e A+.</p>
          <div className="mt-3 grid gap-2">
            {SIZES.map((f) => (
              <label key={f} className={cx('flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-3', s.fontSize === f ? 'border-roxo bg-roxo-claro' : 'border-borda')}>
                <input type="radio" name="fonte" checked={s.fontSize === f} onChange={() => setSetting('fontSize', f)} className="size-5 accent-[#60377D]" />
                <span className={cx('font-semibold', PX[f])}>{FONT_LABEL[f]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </Card>
      <Card>
        <Toggle label="Alto contraste" desc="Texto mais escuro e fundos brancos, para leitura mais fácil." checked={s.highContrast} onChange={(v) => setSetting('highContrast', v)} />
      </Card>
      <Card>
        <p className="leitura">Exemplo: Senhor, hoje começa o Advento e eu quero começar contigo.</p>
      </Card>
    </div>
  );
}
