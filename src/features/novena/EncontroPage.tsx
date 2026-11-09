import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, Music, Trash2, Send } from 'lucide-react';
import { novena, SINAL_DA_CRUZ, convite } from '../../content/novena';
import { canticoById } from '../../content/canticos';
import { db } from '../../db/database';
import { addIntention, removeIntention, toggleMark, useMarks } from '../../db/progress';
import { longDate } from '../../domain/dates';
import { Button, Card, PageHeader, ReviewNote, TextArea } from '../../ui/kit';
import { DoneToggle, FontSizeControl, ShareButton } from '../../ui/reading';
import { useToast } from '../../ui/feedback';

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-borda bg-papel p-4" aria-labelledby={`passo-${n}`}>
      <h2 id={`passo-${n}`} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-roxo">
        <span className="grid size-7 place-items-center rounded-full bg-roxo text-white">{n}</span>
        {title}
      </h2>
      <div className="leitura mt-2">{children}</div>
    </section>
  );
}

export function EncontroPage() {
  const { n = '1' } = useParams();
  const enc = novena.find((e) => String(e.numero) === n);
  const feitos = useMarks('novena');
  const intencoes = useLiveQuery(() => db.intentions.where('encounter').equals(Number(n)).sortBy('createdAt'), [n]);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const toast = useToast();

  if (!enc) return <PageHeader title="Encontro não encontrado" back="/novena" />;
  const cantico = canticoById(enc.canticoId);
  const done = !!feitos?.has(String(enc.numero));
  const prev = novena[enc.numero - 2];
  const next = novena[enc.numero];

  return (
    <div className="space-y-3">
      <PageHeader title={`${enc.numero}º encontro: ${enc.titulo}`} subtitle={`${enc.tema} · sugestão: ${longDate(enc.dataSugerida)}`} back="/novena" actions={<FontSizeControl />} />

      <div className="flex flex-wrap gap-2">
        <DoneToggle done={done} onToggle={() => toggleMark('novena', String(enc.numero))} label="Marcar encontro realizado" doneLabel="Encontro realizado" />
        <ShareButton label="Convidar" title={`Convite: ${enc.numero}º encontro da Novena`} text={convite(enc, longDate(enc.dataSugerida))} card={{ kicker: 'Novena de Natal · convite', title: `${enc.numero}º encontro: ${enc.titulo}`, body: `${enc.tema}.\n\nVenha rezar conosco e preparar o coração para o Natal!`, footer: longDate(enc.dataSugerida) }} />
      </div>

      <Step n={1} title="Acolhida">
        <p>{enc.acolhida}</p>
      </Step>
      <Step n={2} title="Sinal da cruz">
        <p>{SINAL_DA_CRUZ}</p>
      </Step>
      <Step n={3} title="Oração inicial">
        <p>{enc.oracaoInicial}</p>
      </Step>
      <Step n={4} title="Leitura bíblica">
        <p className="font-sans text-lg font-bold">{enc.leitura.referencia}</p>
        <p className="mt-1">{enc.leitura.resumo}</p>
        <p className="mt-2 font-sans text-sm text-tinta-suave">Leiam o texto completo na Bíblia. Depois, um momento de silêncio.</p>
      </Step>
      <Step n={5} title="Reflexão">
        <p>{enc.reflexao}</p>
        <p className="mt-3 font-sans font-semibold">Para conversar ou meditar:</p>
        <ul className="list-disc pl-5">
          {enc.perguntas.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </Step>
      <Step n={6} title="Preces e intenções">
        <p className="font-sans text-base">
          Resposta: <strong>{enc.preces.resposta}</strong>
        </p>
        <ul className="mt-2 space-y-1">
          {enc.preces.intencoes.map((p) => (
            <li key={p}>— {p}</li>
          ))}
          {intencoes?.map((it) => (
            <li key={it.id} className="flex items-start gap-2">
              <span className="flex-1">— {it.text}</span>
              <button type="button" className="grid size-11 shrink-0 place-items-center rounded-full text-erro hover:bg-rosa-claro" aria-label={`Remover intenção: ${it.text}`} onClick={() => removeIntention(it.id)}>
                <Trash2 aria-hidden className="size-5" />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-3 font-sans"
          onSubmit={async (ev) => {
            ev.preventDefault();
            try {
              await addIntention(texto, enc.numero);
              setTexto('');
              setErro('');
              toast('Intenção guardada neste aparelho.');
            } catch (e) {
              setErro((e as Error).message);
            }
          }}
        >
          <TextArea label="Acrescentar uma intenção (opcional)" hint="Fica guardada só neste celular." value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={500} error={erro} rows={2} />
          <Button type="submit" variant="suave" icon={Send} className="mt-2">
            Guardar intenção
          </Button>
        </form>
        <p className="mt-3">Rezemos juntos: Pai-Nosso…</p>
      </Step>
      <Step n={7} title="Gesto concreto">
        <p>{enc.gesto}</p>
      </Step>
      <Step n={8} title="Oração final">
        <p>{enc.oracaoFinal}</p>
        <p className="mt-2">Ave-Maria… Glória ao Pai…</p>
      </Step>
      <Step n={9} title="Cântico">
        {cantico ? (
          <p>
            Sugestão: <strong>{cantico.titulo}</strong>.{' '}
            <Link to={`/canticos#${cantico.id}`} className="inline-flex items-center gap-1 font-sans font-semibold text-roxo underline">
              <Music aria-hidden className="size-4" /> Ver no cancioneiro
            </Link>
          </p>
        ) : (
          <p>Escolham um canto natalino conhecido de todos.</p>
        )}
      </Step>

      <Card>
        <p className="text-tinta-suave">Encerrem com o sinal da cruz e um abraço da paz.</p>
        <div className="mt-3">
          <DoneToggle done={done} onToggle={() => toggleMark('novena', String(enc.numero))} label="Marcar encontro realizado" doneLabel="Encontro realizado" />
        </div>
      </Card>
      <ReviewNote show={enc.revisao === 'pendente'} />

      <nav aria-label="Outros encontros" className="flex justify-between gap-2">
        {prev ? (
          <Link to={`/novena/${prev.numero}`} className="inline-flex min-h-12 items-center gap-1 px-2 font-semibold text-roxo">
            <ChevronLeft aria-hidden className="size-5" /> {prev.numero}º encontro
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/novena/${next.numero}`} className="inline-flex min-h-12 items-center gap-1 px-2 font-semibold text-roxo">
            {next.numero}º encontro <ChevronRight aria-hidden className="size-5" />
          </Link>
        )}
      </nav>
    </div>
  );
}
