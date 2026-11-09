/** Lê os bytes de um Blob/File (usa FileReader quando Blob.arrayBuffer não existe, ex.: navegadores antigos). */
export function readBytes(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.onerror = () => reject(r.error ?? new Error('Falha ao ler o arquivo.'));
    r.readAsArrayBuffer(blob);
  });
}

export function readText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') return blob.text();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error ?? new Error('Falha ao ler o arquivo.'));
    r.readAsText(blob);
  });
}
