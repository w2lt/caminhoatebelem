import { useEffect, useRef, useState } from 'react';
import { Download, Upload, AlertTriangle, HardDrive } from 'lucide-react';
import { createBackup, parseBackup, restoreBackup, BackupError, MAX_BACKUP_BYTES, type RestoreSummary } from '../../services/backup';
import { shareFile } from '../../services/share';
import { setSetting, useSettings } from '../../db/settings';
import { storageEstimate, requestPersistence, friendlyDbError } from '../../db/database';
import { readText } from '../../lib/bytes';
import { Button, Card, PageHeader } from '../../ui/kit';
import { ConfirmDialog } from '../../ui/dialogs';
import { useToast } from '../../ui/feedback';

export function BackupPage() {
  const s = useSettings();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ text: string; summary: RestoreSummary; createdAt: string } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [storage, setStorage] = useState<{ usage: number; quota: number; persisted: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      const est = await storageEstimate();
      const persisted = (await navigator.storage?.persisted?.().catch(() => false)) ?? false;
      if (est) setStorage({ ...est, persisted });
    })();
  }, []);

  async function exportar() {
    setBusy(true);
    try {
      const { json, filename } = await createBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const r = await shareFile(blob, filename, 'Backup do Caminho até Belém');
      if (r !== 'cancelled') {
        await setSetting('lastBackupAt', Date.now());
        toast(r === 'downloaded' ? 'Backup salvo em Downloads/Arquivos.' : 'Backup pronto. Guarde-o num lugar seguro (Drive, e-mail, WhatsApp para você mesmo).');
      }
    } catch (err) {
      toast(friendlyDbError(err), 'erro');
    } finally {
      setBusy(false);
    }
  }

  async function escolher(file: File | undefined) {
    setError('');
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) return setError('Arquivo grande demais para ser um backup.');
    try {
      const text = await readText(file);
      const { summary, createdAt } = await parseBackup(text);
      setPending({ text, summary, createdAt });
    } catch (err) {
      setError(err instanceof BackupError ? err.message : 'Não foi possível ler este arquivo.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const mb = (n: number) => (n / 1024 / 1024).toFixed(1);

  return (
    <div className="space-y-4">
      <PageHeader title="Backup e restauração" back="/mais" />
      <Card className="bg-dourado-claro">
        <p className="flex gap-2 text-dourado-texto">
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>
            Seus dados (agenda, intenções, marcações, Círculo e PDFs) ficam <strong>somente neste celular</strong>. Se você limpar os dados do navegador, desinstalar o app ou trocar de aparelho, eles se perdem — a não ser que tenha um backup.
          </span>
        </p>
      </Card>

      <Card>
        <h2 className="font-display text-[1.625rem] leading-tight text-roxo">Fazer backup</h2>
        <p className="mt-1 text-tinta-suave">
          {s?.lastBackupAt ? `Último backup: ${new Date(s.lastBackupAt).toLocaleString('pt-BR')}.` : 'Você ainda não fez nenhum backup.'}
        </p>
        <Button icon={Download} full className="mt-3" onClick={exportar} disabled={busy}>
          {busy ? 'Preparando…' : 'Fazer backup agora'}
        </Button>
      </Card>

      <Card>
        <h2 className="font-display text-[1.625rem] leading-tight text-roxo">Restaurar backup</h2>
        <p className="mt-1 text-tinta-suave">Escolha um arquivo de backup do Caminho até Belém (.json). Os dados atuais serão substituídos.</p>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" id="backup-input" aria-label="Escolher arquivo de backup" tabIndex={-1} onChange={(e) => escolher(e.target.files?.[0])} />
        <Button variant="secundario" icon={Upload} full className="mt-3" onClick={() => fileRef.current?.click()}>
          Escolher arquivo de backup
        </Button>
        {error && (
          <p role="alert" className="mt-2 rounded-2xl bg-rosa-claro p-4 font-bold text-erro">
            {error}
          </p>
        )}
      </Card>

      {storage && (
        <Card>
          <h2 className="flex items-center gap-2 font-bold">
            <HardDrive aria-hidden className="size-5 text-roxo" /> Armazenamento
          </h2>
          <p className="mt-1 text-tinta-suave">
            Usando {mb(storage.usage)} MB de {mb(storage.quota)} MB disponíveis para o app.
          </p>
          <p className="mt-1 text-tinta-suave">
            {storage.persisted ? 'Armazenamento protegido: o navegador não apagará os dados automaticamente.' : 'O navegador pode apagar os dados se o celular ficar sem espaço.'}
          </p>
          {!storage.persisted && (
            <Button
              variant="suave"
              className="mt-2"
              onClick={async () => {
                const ok = await requestPersistence();
                setStorage((st) => (st ? { ...st, persisted: ok } : st));
                toast(ok ? 'Armazenamento protegido.' : 'O navegador não permitiu. Instale o app na tela inicial e faça backups.', ok ? 'ok' : 'erro');
              }}
            >
              Proteger armazenamento
            </Button>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(v) => !v && setPending(null)}
        title="Restaurar este backup?"
        description={
          pending
            ? `Backup de ${new Date(pending.createdAt).toLocaleString('pt-BR')}: ${pending.summary.events} atividades, ${pending.summary.intentions} intenções, ${pending.summary.pdfs} PDFs e ${pending.summary.progress} marcações. Os dados atuais deste celular serão substituídos.`
            : ''
        }
        confirmLabel="Restaurar e substituir"
        onConfirm={async () => {
          try {
            await restoreBackup(pending!.text);
            toast('Backup restaurado com sucesso.');
          } catch (err) {
            toast(err instanceof BackupError ? err.message : friendlyDbError(err), 'erro');
          }
        }}
      />
    </div>
  );
}
