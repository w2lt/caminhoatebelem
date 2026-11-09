import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarPlus, BellRing, Info } from 'lucide-react';
import { db } from '../../db/database';
import { setSetting, useSettings, type ReminderPrefs } from '../../db/settings';
import { capabilities, plannedReminders, remindersToIcs, requestNotificationPermission } from '../../services/reminders';
import { icsBlob } from '../../services/ics';
import { shareFile } from '../../services/share';
import { useToday } from '../../lib/hooks';
import { Button, Card, PageHeader, TextField, Toggle } from '../../ui/kit';
import { useToast } from '../../ui/feedback';

const ITENS: { key: keyof ReminderPrefs; label: string; desc: string; hasTime: boolean }[] = [
  { key: 'manha', label: 'Oração da manhã', desc: 'Todos os dias do Advento', hasTime: true },
  { key: 'noite', label: 'Oração da noite', desc: 'Todos os dias do Advento', hasTime: true },
  { key: 'coroa', label: 'Acender as velas da coroa', desc: 'Nos quatro domingos', hasTime: true },
  { key: 'novena', label: 'Novena de Natal', desc: 'De 16 a 24 de dezembro', hasTime: true },
  { key: 'presepio', label: 'Presépio', desc: 'Montagem e Menino Jesus na manjedoura', hasTime: true },
  { key: 'missas', label: 'Missas de Natal', desc: 'As que têm lembrete no cadastro', hasTime: false },
  { key: 'eventos', label: 'Eventos da agenda', desc: 'Os que têm lembrete no cadastro', hasTime: false },
];

export function LembretesPage() {
  const s = useSettings();
  const today = useToday();
  const events = useLiveQuery(() => db.events.toArray(), []);
  const [cap, setCap] = useState(capabilities);
  const toast = useToast();
  if (!s) return <PageHeader title="Lembretes" back="/mais" />;

  const prefs = s.reminders;
  const update = (key: keyof ReminderPrefs, patch: Partial<ReminderPrefs[keyof ReminderPrefs]>) =>
    setSetting('reminders', { ...prefs, [key]: { ...prefs[key], ...patch } } as ReminderPrefs);
  const lista = plannedReminders(prefs, Number(today.slice(0, 4)), events ?? [], s.presepioDate, today);

  return (
    <div className="space-y-4">
      <PageHeader title="Lembretes" subtitle="Escolha o que lembrar. Tudo é opcional." back="/mais" />

      <Card>
        <p className="flex gap-2">
          <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-roxo" />
          <span>
            <strong>O jeito mais confiável</strong> é adicionar os lembretes ao <strong>calendário do celular</strong>: ele avisa mesmo com o app fechado e sem internet. Os avisos do próprio app só aparecem enquanto ele estiver aberto
            {cap.ios && !cap.standalone ? ' (e, no iPhone, só depois de instalado na tela inicial)' : ''}.
          </span>
        </p>
      </Card>

      <Card className="grid gap-4">
        {ITENS.map((it) => {
          const p = prefs[it.key] as { on: boolean; time?: string };
          return (
            <div key={it.key} className="border-b border-borda pb-3 last:border-0 last:pb-0">
              <Toggle label={it.label} desc={it.desc} checked={p.on} onChange={(on) => update(it.key, { on })} />
              {it.hasTime && p.on && (
                <TextField className="mt-2 max-w-48" label={`Horário — ${it.label}`} type="time" value={p.time ?? ''} onChange={(e) => e.target.value && update(it.key, { time: e.target.value })} />
              )}
            </div>
          );
        })}
      </Card>

      <Button
        icon={CalendarPlus}
        full
        disabled={lista.length === 0}
        onClick={async () => {
          const r = await shareFile(icsBlob(remindersToIcs(lista)), 'lembretes-caminho-ate-belem.ics', 'Lembretes do Advento');
          if (r === 'downloaded') toast('Arquivo salvo. Abra-o para adicionar ao calendário do celular.');
          if (r === 'shared') toast('Escolha o app de calendário para importar.');
        }}
      >
        Adicionar {lista.length} lembrete{lista.length === 1 ? '' : 's'} ao calendário
      </Button>

      <Card>
        <h2 className="font-bold">Avisos com o app aberto</h2>
        {!cap.notifications ? (
          <p className="mt-1 text-tinta-suave">Este navegador não oferece notificações. Use o calendário do celular.</p>
        ) : cap.permission === 'granted' ? (
          <p className="mt-1 text-verde">Notificações permitidas. Você será avisado enquanto o app estiver aberto.</p>
        ) : cap.permission === 'denied' ? (
          <p className="mt-1 text-tinta-suave">As notificações foram bloqueadas. Para liberar, use as configurações do navegador.</p>
        ) : (
          <Button
            variant="secundario"
            icon={BellRing}
            className="mt-2"
            onClick={async () => {
              const r = await requestNotificationPermission();
              setCap(capabilities());
              toast(r === 'granted' ? 'Notificações permitidas.' : 'Notificações não permitidas.', r === 'granted' ? 'ok' : 'erro');
            }}
          >
            Permitir notificações
          </Button>
        )}
      </Card>
    </div>
  );
}
