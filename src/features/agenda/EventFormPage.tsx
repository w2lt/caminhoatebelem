import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, Trash2, CalendarPlus } from 'lucide-react';
import { db, EVENT_CATEGORIES, MASS_TYPES, friendlyDbError, type AgendaEvent, type EventCategory, type MassType } from '../../db/database';
import { createEvent, deleteEvent, EMPTY_EVENT, updateEvent, validateEvent, type EventInput, type FieldErrors } from '../../db/events';
import { icsBlob } from '../../services/ics';
import { shareFile } from '../../services/share';
import { Button, PageHeader, SelectField, TextArea, TextField } from '../../ui/kit';
import { ConfirmDialog } from '../../ui/dialogs';
import { useToast } from '../../ui/feedback';
import { ShareButton } from '../../ui/reading';
import { eventShareText } from '../shared';
import { toIcsEvents } from './AgendaPage';

const REMINDERS: [string, string][] = [
  ['', 'Sem lembrete'],
  ['0', 'Na hora'],
  ['15', '15 minutos antes'],
  ['30', '30 minutos antes'],
  ['60', '1 hora antes'],
  ['120', '2 horas antes'],
  ['1440', '1 dia antes'],
];

export function EventFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [existing, setExisting] = useState<AgendaEvent | null | undefined>(id ? undefined : null);
  const [form, setForm] = useState<EventInput>(() => {
    const preset = params.get('categoria') as EventCategory | null;
    const mass = params.get('missa') as MassType | null;
    return {
      ...EMPTY_EVENT,
      category: preset && preset in EVENT_CATEGORIES ? preset : EMPTY_EVENT.category,
      ...(mass && mass in MASS_TYPES ? { massType: mass, title: MASS_TYPES[mass].replace(/ \(.*\)$/, ''), date: params.get('data') ?? '' } : {}),
    };
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirm, setConfirm] = useState(false);
  const isMass = form.category === 'missa-natal';

  useEffect(() => {
    if (!id) return;
    db.events.get(id).then((e) => {
      setExisting(e ?? null);
      if (e) {
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = e;
        setForm(rest);
      }
    });
  }, [id]);

  if (id && existing === undefined) return <PageHeader title="Carregando…" back="/agenda" />;
  if (id && existing === null) return <PageHeader title="Atividade não encontrada" back="/agenda" />;

  const set = <K extends keyof EventInput>(k: K, v: EventInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const back = isMass ? '/missas' : '/agenda';

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const v = validateEvent(form);
    if (!v.ok) {
      setErrors(v.errors);
      toast('Confira os campos destacados.', 'erro');
      // espera a tela mostrar os erros e leva o foco ao primeiro campo com problema
      setTimeout(() => {
        const first = document.querySelector('[aria-invalid="true"]');
        if (first instanceof HTMLElement) first.focus();
      }, 0);
      return;
    }
    try {
      if (id) await updateEvent(id, form);
      else await createEvent(form);
      toast(id ? 'Atividade atualizada.' : 'Atividade salva na agenda.');
      navigate(back);
    } catch (err) {
      toast(friendlyDbError(err), 'erro');
    }
  }

  return (
    <div>
      <PageHeader title={id ? 'Editar atividade' : isMass ? 'Nova Missa de Natal' : 'Nova atividade'} back={back} />
      <form onSubmit={submit} noValidate className="grid gap-4">
        <SelectField label="Categoria" value={form.category} onChange={(e) => set('category', e.target.value as EventCategory)}>
          {Object.entries(EVENT_CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </SelectField>
        {isMass && (
          <SelectField label="Tipo de celebração" value={form.massType ?? 'noite'} onChange={(e) => set('massType', e.target.value as MassType)}>
            {Object.entries(MASS_TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectField>
        )}
        <TextField label="Título *" value={form.title} maxLength={120} onChange={(e) => set('title', e.target.value)} error={errors.title} placeholder={isMass ? 'Ex.: Missa da Noite de Natal' : 'Ex.: Confissões na Matriz'} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Data *" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} error={errors.date} />
          <TextField label="Horário" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} error={errors.time} />
        </div>
        <TextField label={isMass ? 'Nome da igreja' : 'Local'} value={form.location} maxLength={160} onChange={(e) => set('location', e.target.value)} error={errors.location} />
        <TextField label="Endereço" value={form.address} maxLength={200} onChange={(e) => set('address', e.target.value)} error={errors.address} />
        <TextField label="Comunidade" value={form.community} maxLength={120} onChange={(e) => set('community', e.target.value)} />
        {!isMass && <TextField label="Responsável" value={form.responsible} maxLength={120} onChange={(e) => set('responsible', e.target.value)} />}
        <TextArea label={isMass ? 'Observações' : 'Descrição'} value={form.description} maxLength={1000} onChange={(e) => set('description', e.target.value)} error={errors.description} />
        <SelectField
          label="Lembrete"
          hint="O lembrete vai junto quando você adiciona ao calendário do celular."
          value={form.reminderMinutes == null ? '' : String(form.reminderMinutes)}
          onChange={(e) => set('reminderMinutes', e.target.value === '' ? null : Number(e.target.value))}
        >
          {REMINDERS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </SelectField>
        {id && (
          <SelectField label="Situação" value={form.status} onChange={(e) => set('status', e.target.value as EventInput['status'])}>
            <option value="agendado">Agendado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </SelectField>
        )}
        <Button type="submit" icon={Save} full>
          Salvar
        </Button>
      </form>

      {existing && (
        <div className="mt-4 grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <ShareButton title={existing.title} text={eventShareText(existing)} label="Compartilhar" />
            <Button
              variant="secundario"
              icon={CalendarPlus}
              onClick={async () => {
                const r = await shareFile(icsBlob(toIcsEvents([existing])), 'evento.ics', existing.title);
                if (r === 'downloaded') toast('Arquivo de calendário salvo. Abra-o para adicionar ao calendário.');
              }}
            >
              Calendário
            </Button>
          </div>
          <Button variant="perigo" icon={Trash2} full onClick={() => setConfirm(true)}>
            Excluir atividade
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Excluir esta atividade?"
        description={`"${existing?.title ?? ''}" será removida da sua agenda. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={async () => {
          await deleteEvent(id!);
          toast('Atividade excluída.');
          navigate(back);
        }}
      />
    </div>
  );
}
