/**
 * Importação e leitura de PDFs da novena (armazenados localmente no IndexedDB).
 *
 * Segurança: o PDF nunca é aberto num <iframe> nem executado. É desenhado página a página
 * em <canvas> pelo pdf.js com eval desativado, sem scripts, formulários XFA ou links ativos.
 */
import { readBytes } from '../lib/bytes';
import { db, newId, storageEstimate, friendlyDbError, type StoredPdf } from '../db/database';

export const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 MB

export class PdfImportError extends Error {}

type PdfJs = typeof import('pdfjs-dist');
let pdfjsPromise: Promise<PdfJs> | null = null;

/** Carrega o pdf.js sob demanda (fica no cache offline após o 1º acesso). */
export function loadPdfJs(): Promise<PdfJs> {
  pdfjsPromise ??= (async () => {
    const [lib, worker] = await Promise.all([
      import('pdfjs-dist/legacy/build/pdf.mjs') as unknown as Promise<PdfJs>,
      import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
    ]);
    lib.GlobalWorkerOptions.workerSrc = (worker as { default: string }).default;
    return lib;
  })();
  return pdfjsPromise;
}

/** Verifica a assinatura "%PDF-" no início do arquivo (até 1 KB, como o padrão permite). */
export async function hasPdfSignature(file: Blob): Promise<boolean> {
  const head = new Uint8Array(await readBytes(file.slice(0, 1024)));
  const sig = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
  outer: for (let i = 0; i <= head.length - sig.length; i++) {
    for (let j = 0; j < sig.length; j++) if (head[i + j] !== sig[j]) continue outer;
    return true;
  }
  return false;
}

/** Validações que não dependem do pdf.js (tipo, tamanho, assinatura). */
export async function precheckPdf(file: File): Promise<void> {
  const looksPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (!looksPdf) throw new PdfImportError('Escolha um arquivo PDF (terminado em .pdf).');
  if (file.size === 0) throw new PdfImportError('O arquivo está vazio.');
  if (file.size > MAX_PDF_BYTES) {
    throw new PdfImportError(`O PDF tem ${(file.size / 1024 / 1024).toFixed(1)} MB. O limite é 20 MB. Peça à comunidade uma versão menor ou compacte o arquivo.`);
  }
  if (!(await hasPdfSignature(file))) throw new PdfImportError('Este arquivo não é um PDF válido ou está corrompido.');
  const est = await storageEstimate();
  if (est && est.quota - est.usage < file.size * 1.2) {
    throw new PdfImportError('Não há espaço suficiente no celular para guardar este PDF. Libere espaço e tente de novo.');
  }
}

export function sanitizeFileName(name: string): string {
  const base = name.replace(/\.pdf$/i, '').replace(/[^\p{L}\p{N} ._()-]/gu, '').trim().slice(0, 80);
  return (base || 'novena') + '.pdf';
}

export async function openPdf(data: ArrayBuffer) {
  const pdfjs = await loadPdfJs();
  return pdfjs.getDocument({
    data,
    isEvalSupported: false,
    enableXfa: false,
    disableAutoFetch: true,
    stopAtErrors: false,
  }).promise;
}

/** Valida, abre (para garantir que não está corrompido/protegido) e guarda o PDF. */
export async function importPdf(file: File): Promise<StoredPdf> {
  await precheckPdf(file);
  let pages = 0;
  try {
    const doc = await openPdf(await readBytes(file));
    pages = doc.numPages;
    await doc.destroy();
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === 'PasswordException') throw new PdfImportError('Este PDF está protegido por senha. Peça à comunidade uma versão sem senha.');
    throw new PdfImportError('Não foi possível abrir este PDF. Ele pode estar corrompido.');
  }
  if (pages < 1) throw new PdfImportError('O PDF não tem páginas.');
  const rec: StoredPdf = {
    id: newId(),
    name: sanitizeFileName(file.name),
    size: file.size,
    pages,
    blob: new Blob([await readBytes(file)], { type: 'application/pdf' }),
    addedAt: Date.now(),
  };
  try {
    await db.pdfs.add(rec);
  } catch (err) {
    throw new PdfImportError(friendlyDbError(err));
  }
  return rec;
}

export async function deletePdf(id: string) {
  await db.pdfs.delete(id);
}
