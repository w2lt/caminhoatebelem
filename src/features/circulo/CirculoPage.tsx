import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { FileUp, FileText, Trash2, Save, Check, ChevronDown, Share2, CalendarPlus, Loader2 } from 'lucide-react';
import { db, type Circle } from '../../db/database';
import { emptyCircle, saveCircle, toggleMeetingDone } from '../../db/circle';
import { deletePdf, importPdf, MAX_PDF_BYTES, PdfImportError } from '../../services/pdf';
import { icsBlob } from '../../services/ics';
import { shareFile } from '../../services/share';
import { tinyDate } from '../../domain/dates';
import { useToday } from '../../lib/hooks';
import { Button, Card, EmptyState, PageHeader, TextArea, TextField, cx } from '../../ui/kit';
import { ConfirmDialog } from '../../ui/dialogs';
import { ShareButton } from '../../ui/reading';
import { useToast } from '../../ui/feedback';

function programacao(c: Circle): string {
  const linhas = c.meetings.map(
    (m) => `${m.number}º encontro — ${m.date ? tinyDate(m.date) : 'data a definir'}${m.time ? ` às ${m.time}` : ''}${m.family ? ` · ${m.family}` : ''}${m.address ? ` · ${m.address}` : ''}`,
  );
  return [`Novena de Natal — ${c.name || 'Círculo Bíblico'}`, c.community ? `Comunidade: ${c.community}` : '', '', ...linhas].filter((l) => l !== undefined).join('\n');
}

export function CirculoPage() {
  const today = useToday();
  const ano = Number(today.slice(0, 4));
  // null = ainda não cadastrado; undefined = carregando
  const saved = useLiveQuery(async () => (await db.circle.get('principal')) ?? null, []);
  const pdfs = useLiveQuery(() => db.pdfs.orderBy('addedAt').reverse().toArray(), []);
  const [form, setForm] = useState<Circle | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [toDelete, setToDelete] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (saved !== undefined && form === null) setForm(saved ?? emptyCircle(ano));
  }, [saved, form, ano]);

  if (!form) return <PageHeader title="Círculo Bíblico" back="/novena" />;

  const set = (patch: Partial<Circle>) => setForm({ ...form, ...patch });
  const setMeeting = (number: number, patch: Partial<Circle['meetings'][number]>) =>
    setForm({ ...form, meetings: form.meetings.map((m) => (m.number === number ? { ...m, ...patch } : m)) });

  async function salvar() {
    try {
      await saveCircle(form!);
      toast('Novena do Círculo salva.');
    } catch {
      toast('Confira os campos: há algum valor inválido.', 'erro');
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setPdfError('');
    setBusy(true);
    try {
      const rec = await importPdf(file);
      const next = { ...form!, pdfId: rec.id };
      setForm(next);
      await saveCircle(next);
      toast(`PDF "${rec.name}" importado (${rec.pages} páginas). Disponível sem internet.`);
    } catch (err) {
      setPdfError(err instanceof PdfImportError ? err.message : 'Não foi possível importar o PDF.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const feitos = form.meetings.filter((m) => m.done).length;

  return (
    <div className="space-y-4">
      <PageHeader title="Novena do Círculo Bíblico" subtitle="Organize os encontros da novena da sua comunidade." back="/novena" />

      <Card>
        <h2 className="mb-3 font-serif text-lg font-bold text-roxo">Grupo</h2>
        <div className="grid gap-3">
          <TextField label="Nome do Círculo Bíblico" value={form.name} maxLength={120} onChange={(e) => set({ name: e.target.value })} placeholder="Ex.: Círculo Sagrada Família" />
          <TextField label="Comunidade / paróquia" value={form.community} maxLength={120} onChange={(e) => set({ community: e.target.value })} />
          <TextArea label="Observações" value={form.notes} maxLength={1000} onChange={(e) => set({ notes: e.target.value })} />
        </div>
      </Card>

      <section aria-labelledby="encontros-circulo">
        <div className="mb-2 flex items-end justify-between">
          <h2 id="encontros-circulo" className="font-serif text-xl font-bold text-roxo">
            Encontros
          </h2>
          <p className="font-semibold text-verde">{feitos} de 9 realizados</p>
        </div>
        <ol className="grid gap-2">
          {form.meetings.map((m) => {
            const isOpen = open === m.number;
            return (
              <li key={m.number} className={cx('rounded-2xl border bg-papel', m.date === today ? 'border-2 border-roxo' : 'border-borda')}>
                <div className="flex items-center gap-2 p-2">
                  <button
                    type="button"
                    aria-pressed={m.done}
                    aria-label={`Encontro ${m.number} realizado`}
                    onClick={async () => {
                      setMeeting(m.number, { done: !m.done });
                      if (saved) await toggleMeetingDone(m.number);
                    }}
                    className={cx('grid size-11 shrink-0 place-items-center rounded-full border-2 font-bold', m.done ? 'border-verde bg-verde text-white' : 'border-roxo text-roxo')}
                  >
                    {m.done ? <Check aria-hidden className="size-6" /> : m.number}
                  </button>
                  <button type="button" aria-expanded={isOpen} aria-controls={`enc-${m.number}`} onClick={() => setOpen(isOpen ? null : m.number)} className="flex min-h-12 flex-1 items-center gap-2 text-left">
                    <span className="flex-1">
                      <span className="block font-semibold">{m.number}º encontro</span>
                      <span className="block text-sm text-tinta-suave">
                        {m.date ? tinyDate(m.date) : 'Sem data'}
                        {m.time && ` · ${m.time}`}
                        {m.family && ` · ${m.family}`}
                      </span>
                    </span>
                    <ChevronDown aria-hidden className={cx('size-5 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                </div>
                {isOpen && (
                  <div id={`enc-${m.number}`} className="grid gap-3 border-t border-borda p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <TextField label="Data" type="date" value={m.date} onChange={(e) => setMeeting(m.number, { date: e.target.value })} />
                      <TextField label="Horário" type="time" value={m.time} onChange={(e) => setMeeting(m.number, { time: e.target.value })} />
                    </div>
                    <TextField label="Endereço" value={m.address} maxLength={200} onChange={(e) => setMeeting(m.number, { address: e.target.value })} />
                    <TextField label="Família ou responsável" value={m.family} maxLength={120} onChange={(e) => setMeeting(m.number, { family: e.target.value })} />
                    <TextArea label="Observações" value={m.notes} maxLength={500} onChange={(e) => setMeeting(m.number, { notes: e.target.value })} rows={2} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-2">
        <Button icon={Save} full onClick={salvar}>
          Salvar novena do Círculo
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <ShareButton label="Programação" title="Programação da novena" text={programacao(form)} />
          <Button
            variant="secundario"
            icon={CalendarPlus}
            onClick={async () => {
              const evs = form.meetings
                .filter((m) => m.date)
                .map((m) => ({
                  uid: `circulo-${m.number}-${m.date}`,
                  title: `Novena (${form.name || 'Círculo Bíblico'}) — ${m.number}º encontro`,
                  date: m.date,
                  time: m.time || undefined,
                  location: m.address,
                  description: [m.family && `Família: ${m.family}`, m.notes].filter(Boolean).join('\n'),
                  alarmMinutes: m.time ? 60 : null,
                }));
              if (!evs.length) return toast('Informe as datas dos encontros primeiro.', 'erro');
              const r = await shareFile(icsBlob(evs), 'novena-circulo.ics', 'Novena do Círculo');
              if (r === 'downloaded') toast('Arquivo de calendário salvo. Abra-o para adicionar ao calendário do celular.');
            }}
          >
            Calendário
          </Button>
        </div>
      </div>

      <Card aria-labelledby="pdf-titulo">
        <h2 id="pdf-titulo" className="flex items-center gap-2 font-serif text-lg font-bold text-roxo">
          <FileText aria-hidden className="size-5" /> PDF da novena da comunidade
        </h2>
        <p className="mt-1 text-tinta-suave">Importe o PDF que sua comunidade usa. Ele fica guardado neste celular e abre sem internet. Tamanho máximo: {MAX_PDF_BYTES / 1024 / 1024} MB.</p>
        <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="sr-only" id="pdf-input" aria-label="Escolher arquivo PDF da novena" tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
        <Button variant="secundario" icon={busy ? Loader2 : FileUp} full className="mt-3" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? 'Verificando o PDF…' : 'Importar PDF'}
        </Button>
        {pdfError && (
          <p role="alert" className="mt-2 rounded-xl bg-rosa-claro p-3 font-medium text-erro">
            {pdfError}
          </p>
        )}
        <div className="mt-3 grid gap-2">
          {pdfs?.length === 0 && <EmptyState icon={FileText} title="Nenhum PDF importado ainda." />}
          {pdfs?.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-xl border border-borda p-2">
              <Link to={`/circulo/pdf/${p.id}`} className="flex min-h-12 flex-1 items-center gap-2 font-semibold text-roxo">
                <FileText aria-hidden className="size-5 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate">{p.name}</span>
                  <span className="block text-sm font-normal text-tinta-suave">
                    {p.pages} páginas · {(p.size / 1024 / 1024).toFixed(1)} MB{form.pdfId === p.id ? ' · usado pelo Círculo' : ''}
                  </span>
                </span>
              </Link>
              <button type="button" onClick={() => setToDelete(p.id)} className="grid size-11 place-items-center rounded-full text-erro hover:bg-rosa-claro" aria-label={`Excluir ${p.name}`}>
                <Trash2 aria-hidden className="size-5" />
              </button>
            </div>
          ))}
        </div>
      </Card>
      <p className="flex items-center gap-2 text-sm text-tinta-suave">
        <Share2 aria-hidden className="size-4" /> Os dados do Círculo ficam só neste celular. Faça backup em Mais → Backup.
      </p>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Excluir este PDF?"
        description="O arquivo será apagado deste celular. Você pode importá-lo de novo depois."
        confirmLabel="Excluir PDF"
        onConfirm={async () => {
          if (!toDelete) return;
          await deletePdf(toDelete);
          if (form.pdfId === toDelete) {
            const next = { ...form, pdfId: undefined };
            setForm(next);
            if (saved) await saveCircle(next);
          }
          toast('PDF excluído.');
        }}
      />
    </div>
  );
}
