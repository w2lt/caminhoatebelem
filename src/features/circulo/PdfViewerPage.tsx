import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ZoomIn, ZoomOut, FileText, Type } from 'lucide-react';
import { db } from '../../db/database';
import { openPdf } from '../../services/pdf';
import { readBytes } from '../../lib/bytes';
import { Button, EmptyState, PageHeader } from '../../ui/kit';

type Doc = Awaited<ReturnType<typeof openPdf>>;

/** Uma página desenhada em canvas, só quando aparece na tela (economiza memória em celulares). */
function PdfPage({ doc, n, zoom }: { doc: Doc; n: number; zoom: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(n <= 2);

  useEffect(() => {
    const el = box.current;
    if (!el || visible) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true), { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let task: { cancel(): void } | null = null;
    (async () => {
      const page = await doc.getPage(n);
      if (cancelled || !ref.current) return;
      const width = (box.current?.clientWidth ?? 360) * zoom;
      const base = page.getViewport({ scale: 1 });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: (width / base.width) * dpr });
      const canvas = ref.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const t = page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]);
      task = t;
      await t.promise.catch(() => {});
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, n, zoom, visible]);

  return (
    <div ref={box} className="overflow-x-auto rounded-lg bg-white shadow">
      <canvas ref={ref} role="img" aria-label={`Página ${n} de ${doc.numPages}`} className="mx-auto block" style={{ minHeight: visible ? undefined : 400 }} />
    </div>
  );
}

export function PdfViewerPage() {
  const { id = '' } = useParams();
  const rec = useLiveQuery(async () => (await db.pdfs.get(id)) ?? null, [id]);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [asText, setAsText] = useState(false);
  const [text, setText] = useState<string[] | null>(null);

  useEffect(() => {
    if (!rec) return;
    let alive = true;
    let opened: Doc | null = null;
    readBytes(rec.blob)
      .then((buf) => openPdf(buf))
      .then((d) => {
        opened = d;
        if (alive) setDoc(d);
        else void d.destroy();
      })
      .catch(() => alive && setError('Não foi possível abrir este PDF. Ele pode estar corrompido. Exclua e importe novamente.'));
    return () => {
      alive = false;
      void opened?.destroy();
    };
  }, [rec]);

  useEffect(() => {
    if (!asText || !doc || text) return;
    (async () => {
      const pages: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const p = await doc.getPage(i);
        const c = await p.getTextContent();
        pages.push(c.items.map((it) => ('str' in it ? it.str : '')).join(' ').replace(/\s+/g, ' ').trim());
      }
      setText(pages);
    })().catch(() => setText([]));
  }, [asText, doc, text]);

  if (rec === undefined && !error) return <PageHeader title="Abrindo PDF…" back="/circulo" />;
  if (rec === null || (!rec && !doc)) {
    return (
      <div>
        <PageHeader title="PDF não encontrado" back="/circulo" />
        <EmptyState icon={FileText} title="Este PDF não está mais neste aparelho." />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageHeader title={rec?.name ?? 'PDF'} subtitle={doc ? `${doc.numPages} páginas · disponível sem internet` : 'Carregando…'} back="/circulo" />
      {error && (
        <p role="alert" className="rounded-2xl bg-rosa-claro p-4 font-bold text-erro">
          {error}
        </p>
      )}
      {doc && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 bg-creme py-2">
          <Button variant="secundario" icon={ZoomOut} onClick={() => setZoom((z) => Math.max(1, z - 0.5))} disabled={zoom <= 1 || asText} aria-label="Diminuir zoom">
            <span className="sr-only">Diminuir</span>
          </Button>
          <Button variant="secundario" icon={ZoomIn} onClick={() => setZoom((z) => Math.min(3, z + 0.5))} disabled={zoom >= 3 || asText} aria-label="Aumentar zoom">
            <span className="sr-only">Aumentar</span>
          </Button>
          <Button variant={asText ? 'primario' : 'suave'} icon={Type} onClick={() => setAsText((v) => !v)} aria-pressed={asText}>
            {asText ? 'Ver páginas' : 'Ver como texto'}
          </Button>
        </div>
      )}
      {doc && !asText && (
        <div className="grid gap-3">
          {Array.from({ length: doc.numPages }, (_, i) => (
            <PdfPage key={i + 1} doc={doc} n={i + 1} zoom={zoom} />
          ))}
        </div>
      )}
      {doc && asText && (
        <div className="leitura space-y-4 rounded-2xl bg-papel p-4">
          {!text && <p>Extraindo o texto…</p>}
          {text?.every((t) => !t) && <p>Este PDF não tem texto selecionável (pode ser uma imagem escaneada). Use a visualização de páginas.</p>}
          {text?.map((t, i) =>
            t ? (
              <section key={i} aria-label={`Página ${i + 1}`}>
                <h2 className="font-sans text-sm font-bold text-tinta-suave">Página {i + 1}</h2>
                <p>{t}</p>
              </section>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
