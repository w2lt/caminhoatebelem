import { Music, Flame, Sparkles } from 'lucide-react';
import { oracoesTradicionais } from '../../content/tradicoes';
import { MenuLink, PageHeader } from '../../ui/kit';
import { FontSizeControl, ReadingCard, ShareButton } from '../../ui/reading';

export function OracoesPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Orações e cânticos" back="/rezar" actions={<FontSizeControl />} />
      <div className="grid gap-2">
        <MenuLink to="/canticos" icon={Music} title="Cânticos por ocasião" desc="Advento, coroa, presépio, novena e Natal" tone="rosa" />
        <MenuLink to="/coroa" icon={Flame} title="Orações da coroa do Advento" desc="Uma oração para cada domingo" tone="dourado" />
        <MenuLink to="/presepio" icon={Sparkles} title="Oração da montagem do presépio" tone="verde" />
      </div>
      {oracoesTradicionais.map((o) => (
        <ReadingCard key={o.titulo} kicker={o.titulo} actions={<ShareButton title={o.titulo} text={o.texto} card={{ kicker: o.titulo, body: o.texto }} />}>
          <p>{o.texto}</p>
        </ReadingCard>
      ))}
    </div>
  );
}
