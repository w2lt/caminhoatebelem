/** Diálogos acessíveis (Radix): foco preso, Esc fecha, título e descrição anunciados. */
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState, type ReactNode } from 'react';
import { X, Share2, Copy, Download, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { Button, cx } from './kit';
import { useToast } from './feedback';
import { CARD_FORMATS, renderCard, type CardContent, type CardFormat } from '../services/cards';
import { copyText, downloadBlob, shareFile, shareText, slug, whatsappUrl, withSignature } from '../services/share';

export function Sheet({ open, onOpenChange, title, description, children }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; description?: string; children: ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/45" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-papel p-5 pb-8 shadow-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
          {...(description ? {} : { 'aria-describedby': undefined })}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <Dialog.Title className="font-serif text-xl font-bold text-roxo">{title}</Dialog.Title>
            <Dialog.Close className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-roxo-claro" aria-label="Fechar">
              <X aria-hidden className="size-6" />
            </Dialog.Close>
          </div>
          {description && <Dialog.Description className="mb-4 text-tinta-suave">{description}</Dialog.Description>}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm, danger = true }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; description: string; confirmLabel: string; onConfirm: () => void | Promise<void>; danger?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex flex-col gap-3">
        <Button
          variant={danger ? 'perigo' : 'primario'}
          full
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onOpenChange(false);
            } finally {
              setBusy(false);
            }
          }}
        >
          {confirmLabel}
        </Button>
        <Button variant="secundario" full onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
      </div>
    </Sheet>
  );
}

/**
 * Compartilhar: texto (menu nativo, copiar, WhatsApp) e cartão visual em 3 formatos.
 * O cartão é gerado localmente; se o texto não couber num formato, o app avisa.
 */
export function ShareDialog({ open, onOpenChange, title, text, card }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; text: string; card?: CardContent }) {
  const toast = useToast();
  const [format, setFormat] = useState<CardFormat>('story');
  const [preview, setPreview] = useState<{ url: string; blob: Blob } | null | 'nao-cabe' | 'erro'>(null);
  const signed = withSignature(text);

  useEffect(() => {
    if (!open || !card) return;
    let url = '';
    let alive = true;
    setPreview(null);
    renderCard(format, card)
      .then((blob) => {
        if (!alive) return;
        if (!blob) return setPreview('nao-cabe');
        url = URL.createObjectURL(blob);
        setPreview({ url, blob });
      })
      .catch(() => alive && setPreview('erro'));
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, card, format]);

  const filename = `${slug(card?.kicker ?? title)}-${format}.png`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Compartilhar" description={title}>
      <div className="grid gap-3">
        <Button
          icon={Share2}
          full
          onClick={async () => {
            const r = await shareText(title, signed).catch(() => null);
            if (r === 'copied') toast('Texto copiado. Cole onde quiser compartilhar.');
            if (r === null) toast('Não foi possível compartilhar.', 'erro');
          }}
        >
          Compartilhar texto
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secundario"
            icon={Copy}
            onClick={async () => {
              try {
                await copyText(signed);
                toast('Texto copiado.');
              } catch {
                toast('Não foi possível copiar.', 'erro');
              }
            }}
          >
            Copiar
          </Button>
          <a
            href={whatsappUrl(signed)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-verde bg-papel px-4 font-semibold text-verde"
          >
            <MessageCircle aria-hidden className="size-5" /> WhatsApp
          </a>
        </div>
      </div>

      {card && (
        <div className="mt-6 border-t border-borda pt-4">
          <h3 className="mb-2 flex items-center gap-2 font-semibold">
            <ImageIcon aria-hidden className="size-5 text-roxo" /> Cartão para compartilhar
          </h3>
          <fieldset>
            <legend className="sr-only">Formato do cartão</legend>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CARD_FORMATS) as CardFormat[]).map((f) => (
                <label
                  key={f}
                  className={cx('flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 px-2 text-center text-sm font-semibold', format === f ? 'border-roxo bg-roxo-claro text-roxo' : 'border-borda')}
                >
                  <input type="radio" name="formato" className="sr-only" checked={format === f} onChange={() => setFormat(f)} />
                  {f === 'story' ? '9:16' : f === 'feed' ? '4:5' : '1:1'}
                </label>
              ))}
            </div>
            <p className="mt-1 text-sm text-tinta-suave">{CARD_FORMATS[format].label}</p>
          </fieldset>
          <div className="mt-3 grid place-items-center rounded-xl bg-creme p-3">
            {preview === null && <p className="py-10 text-tinta-suave">Preparando o cartão…</p>}
            {preview === 'nao-cabe' && <p className="py-6 text-center">Este texto é longo demais para o formato {CARD_FORMATS[format].label.split(' ')[0]}. Escolha outro formato ou compartilhe o texto.</p>}
            {preview === 'erro' && <p className="py-6 text-center text-erro">Não foi possível gerar o cartão neste aparelho.</p>}
            {typeof preview === 'object' && preview && (
              <img src={preview.url} alt={`Cartão: ${card.kicker}. ${card.title ?? ''}`} className="max-h-80 w-auto rounded-lg shadow" />
            )}
          </div>
          {typeof preview === 'object' && preview && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Button
                icon={Share2}
                onClick={async () => {
                  const r = await shareFile(preview.blob, filename, title).catch(() => null);
                  if (r === 'downloaded') toast('Imagem salva. Procure em Downloads/Arquivos.');
                  if (r === null) toast('Não foi possível compartilhar a imagem.', 'erro');
                }}
              >
                Imagem
              </Button>
              <Button
                variant="secundario"
                icon={Download}
                onClick={() => {
                  downloadBlob(preview.blob, filename);
                  toast('Imagem salva.');
                }}
              >
                Salvar
              </Button>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
