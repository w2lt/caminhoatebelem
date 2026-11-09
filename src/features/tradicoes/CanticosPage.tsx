import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Heart, Music } from 'lucide-react';
import { canticos, OCASIOES } from '../../content/canticos';
import type { OcasiaoCantico } from '../../content/schema';
import { db } from '../../db/database';
import { Badge, Card, EmptyState, ExternalLink, PageHeader, cx } from '../../ui/kit';
import { useToast } from '../../ui/feedback';

const DIREITOS = {
  'dominio-publico': 'Domínio público',
  licenciado: 'Licenciado',
  'protegido-sem-licenca': 'Letra não incluída (direitos autorais)',
};

export function CanticosPage() {
  const [filtro, setFiltro] = useState<OcasiaoCantico | 'todos' | 'minha-lista'>('todos');
  const saved = useLiveQuery(async () => new Set((await db.songs.toArray()).map((s) => s.id)), []);
  const { hash } = useLocation();
  const toast = useToast();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);

  const lista = canticos.filter((c) => (filtro === 'todos' ? true : filtro === 'minha-lista' ? saved?.has(c.id) : c.ocasioes.includes(filtro)));

  async function toggle(id: string) {
    if (saved?.has(id)) {
      await db.songs.delete(id);
      toast('Removido da sua lista.');
    } else {
      await db.songs.put({ id, addedAt: Date.now() });
      toast('Adicionado à sua lista de cânticos.');
    }
  }

  const chips: [typeof filtro, string][] = [['todos', 'Todos'], ['minha-lista', 'Minha lista'], ...(Object.entries(OCASIOES) as [OcasiaoCantico, string][])];

  return (
    <div className="space-y-4">
      <PageHeader title="Cânticos" subtitle="Sugestões por ocasião. Letras só de obras em domínio público ou licenciadas." back="/mais" />
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por ocasião">
        {chips.map(([k, v]) => (
          <button
            key={k}
            type="button"
            aria-pressed={filtro === k}
            onClick={() => setFiltro(k)}
            className={cx('min-h-11 rounded-full border-2 px-3 text-sm font-semibold', filtro === k ? 'border-roxo bg-roxo text-white' : 'border-borda bg-papel')}
          >
            {v}
          </button>
        ))}
      </div>

      {lista.length === 0 && (
        <EmptyState icon={Music} title={filtro === 'minha-lista' ? 'Sua lista está vazia.' : 'Nenhum cântico nesta ocasião.'}>
          {filtro === 'minha-lista' && 'Toque no coração de um cântico para guardá-lo aqui.'}
        </EmptyState>
      )}

      {lista.map((c) => {
        const fav = !!saved?.has(c.id);
        return (
          <Card key={c.id} as="article" aria-labelledby={`c-${c.id}`}>
            <div id={c.id} className="scroll-mt-4" />
            <div className="flex items-start gap-2">
              <h2 id={`c-${c.id}`} className="flex-1 font-serif text-lg font-bold">
                {c.titulo}
              </h2>
              <button
                type="button"
                aria-pressed={fav}
                aria-label={fav ? `Remover ${c.titulo} da minha lista` : `Guardar ${c.titulo} na minha lista`}
                onClick={() => toggle(c.id)}
                className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-rosa-claro"
              >
                <Heart aria-hidden className={cx('size-6', fav ? 'fill-rosa-texto text-rosa-texto' : 'text-tinta-suave')} />
              </button>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {c.ocasioes.map((o) => (
                <Badge key={o} tone="rosa">
                  {OCASIOES[o]}
                </Badge>
              ))}
            </div>
            <p className="mt-2">{c.descricao}</p>
            {c.letra && <p className="leitura mt-3 whitespace-pre-line rounded-xl bg-creme p-3">{c.letra}</p>}
            <p className="mt-2 text-sm text-tinta-suave">
              {DIREITOS[c.direitos]} · {c.fonte}
            </p>
            {c.linkAutorizado && (
              <p className="mt-1">
                <ExternalLink href={c.linkAutorizado}>Ouvir/ver na fonte autorizada</ExternalLink>
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
