/**
 * Compartilhamento: Web Share API quando existe; alternativas — copiar texto, salvar imagem,
 * abrir WhatsApp com o texto. Nada é enviado a servidores do app.
 */

export const SIGNATURE = '— Caminho até Belém';

export type ShareResult = 'shared' | 'copied' | 'downloaded' | 'cancelled';

export function withSignature(text: string): string {
  return `${text.trim()}\n\n${SIGNATURE}`;
}

export function canShareText(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export function canShareFiles(file: File): boolean {
  try {
    return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Alternativa para navegadores antigos
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  ta.remove();
  if (!ok) throw new Error('Não foi possível copiar.');
}

function isAbort(err: unknown) {
  return (err as { name?: string })?.name === 'AbortError';
}

/** Compartilha texto pelo menu nativo; sem suporte, copia para a área de transferência. */
export async function shareText(title: string, text: string): Promise<ShareResult> {
  if (canShareText()) {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch (err) {
      if (isAbort(err)) return 'cancelled';
    }
  }
  await copyText(text);
  return 'copied';
}

export function whatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Compartilha um arquivo (ex.: cartão PNG, .ics); sem suporte, baixa o arquivo. */
export async function shareFile(blob: Blob, filename: string, title: string): Promise<ShareResult> {
  const file = new File([blob], filename, { type: blob.type });
  if (canShareFiles(file)) {
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (err) {
      if (isAbort(err)) return 'cancelled';
    }
  }
  downloadBlob(blob, filename);
  return 'downloaded';
}

export function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}
