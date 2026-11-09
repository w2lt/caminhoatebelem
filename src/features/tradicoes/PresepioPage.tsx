import { Link } from 'react-router-dom';
import { Bell, CalendarPlus, Music } from 'lucide-react';
import { presepio } from '../../content/tradicoes';
import { canticoById } from '../../content/canticos';
import { setSetting, useSettings } from '../../db/settings';
import { liturgicalDay } from '../../domain/liturgical';
import { addDaysIso, isValidIso, longDate } from '../../domain/dates';
import { icsBlob } from '../../services/ics';
import { shareFile } from '../../services/share';
import { useToday } from '../../lib/hooks';
import { Button, Card, PageHeader, ReviewNote, TextField } from '../../ui/kit';
import { FontSizeControl, ReadingCard, ShareButton } from '../../ui/reading';
import { useToast } from '../../ui/feedback';

export function PresepioPage() {
  const s = useSettings();
  const today = useToday();
  const cal = liturgicalDay(today).cal;
  const sugerida = cal.domingos[0];
  const data = s?.presepioDate ?? sugerida;
  const toast = useToast();
  const cantico = canticoById(presepio.canticoId);

  return (
    <div className="space-y-4">
      <PageHeader title="Presépio" subtitle="Significado, montagem e oração." back="/mais" actions={<FontSizeControl />} />

      <ReadingCard kicker="O que é o presépio">
        <p>{presepio.introducao}</p>
      </ReadingCard>

      <Card aria-labelledby="data-presepio">
        <h2 id="data-presepio" className="font-serif text-lg font-bold text-roxo">
          Quando montar
        </h2>
        <p className="mt-1">{presepio.dataSugerida}</p>
        <p className="mt-2 font-semibold">Sugestão: {longDate(sugerida)} (1º Domingo do Advento).</p>
        <TextField
          className="mt-3"
          label="Data escolhida pela família"
          type="date"
          value={data}
          onChange={(e) => {
            const v = e.target.value;
            if (isValidIso(v)) void setSetting('presepioDate', v);
          }}
        />
        {s?.presepioDate && s.presepioDate !== sugerida && (
          <button type="button" className="mt-2 min-h-11 font-semibold text-roxo underline" onClick={() => setSetting('presepioDate', null)}>
            Voltar para a data sugerida
          </button>
        )}
        <div className="mt-3 grid gap-2">
          <Button
            icon={CalendarPlus}
            variant="secundario"
            onClick={async () => {
              const blob = icsBlob([
                { uid: 'presepio-montagem', title: 'Montar o presépio', date: data, time: s?.reminders.presepio.time ?? '10:00', description: presepio.oracao, alarmMinutes: 0 },
                { uid: 'presepio-menino', title: 'Colocar o Menino Jesus na manjedoura', date: addDaysIso(cal.natal, -1), time: '22:00', description: presepio.oracaoMenino, alarmMinutes: 0 },
              ]);
              const r = await shareFile(blob, 'presepio.ics', 'Presépio');
              if (r === 'downloaded') toast('Arquivo salvo. Abra-o para adicionar os lembretes ao calendário do celular.');
            }}
          >
            Lembretes no calendário do celular
          </Button>
          <Link to="/lembretes" className="inline-flex min-h-11 items-center gap-2 font-semibold text-roxo">
            <Bell aria-hidden className="size-5" /> Configurar lembretes do app
          </Link>
        </div>
      </Card>

      <Card aria-labelledby="personagens">
        <h2 id="personagens" className="font-serif text-lg font-bold text-roxo">
          Personagens e significados
        </h2>
        <dl className="mt-2 divide-y divide-borda">
          {presepio.personagens.map((p) => (
            <div key={p.nome} className="py-2">
              <dt className="font-semibold">{p.nome}</dt>
              <dd className="text-tinta-suave">{p.significado}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card aria-labelledby="montagem">
        <h2 id="montagem" className="font-serif text-lg font-bold text-roxo">
          Passo a passo da montagem
        </h2>
        <ol className="mt-2 list-decimal space-y-2 pl-6">
          {presepio.tutorial.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </Card>

      <ReadingCard kicker="Oração para a montagem" tone="verde" actions={<ShareButton title="Oração para montar o presépio" text={presepio.oracao} card={{ kicker: 'Oração do presépio', body: presepio.oracao }} />}>
        <p>{presepio.oracao}</p>
      </ReadingCard>

      <ReadingCard kicker="Ao colocar o Menino Jesus (Natal)" tone="dourado" actions={<ShareButton title="Oração do Menino Jesus" text={presepio.oracaoMenino} card={{ kicker: 'Natal · Menino Jesus', body: presepio.oracaoMenino }} />}>
        <p>{presepio.oracaoMenino}</p>
      </ReadingCard>

      {cantico && (
        <Link to={`/canticos#${cantico.id}`} className="flex min-h-14 items-center gap-2 rounded-2xl border border-borda bg-papel p-3 font-semibold text-roxo">
          <Music aria-hidden className="size-5" /> Cântico sugerido: {cantico.titulo}
        </Link>
      )}
      <ReviewNote show />
    </div>
  );
}
