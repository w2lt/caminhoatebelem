/**
 * Cartões visuais gerados localmente (canvas), sem IA e sem internet.
 * Formatos: 1080×1920 (9:16), 1080×1350 (4:5) e 1080×1080 (1:1).
 * O texto é quebrado em linhas e a fonte diminui até caber na área útil — nunca corta.
 * Se nem no tamanho mínimo couber, o formato é marcado como indisponível para aquele texto.
 */

export type CardFormat = 'story' | 'feed' | 'square';
export const CARD_FORMATS: Record<CardFormat, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: 'Vertical 9:16 (status e stories)' },
  feed: { w: 1080, h: 1350, label: 'Retrato 4:5 (feed)' },
  square: { w: 1080, h: 1080, label: 'Quadrado 1:1' },
};

export interface CardContent {
  /** Rótulo pequeno no topo, ex.: "Oração da manhã". */
  kicker: string;
  /** Título opcional, ex.: tema do dia. */
  title?: string;
  body: string;
  /** Linha de rodapé, ex.: "1º Domingo do Advento · 29/11". */
  footer?: string;
}

export interface Measurer {
  measureText(text: string): { width: number };
  font: string;
}

export interface TextLayout {
  lines: string[];
  size: number;
  lineHeight: number;
}

// Fontes da identidade (incorporadas ao app); as alternativas cobrem o caso de ainda não terem carregado.
const SERIF = "'Literata', Georgia, 'Times New Roman', serif";
const DISPLAY = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Nunito Sans', 'Segoe UI', Roboto, Arial, sans-serif";

/** Quebra o texto (respeitando parágrafos) em linhas que cabem em maxWidth. */
export function wrapText(ctx: Measurer, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  const paragraphs = text.replace(/\r/g, '').split(/\n+/);
  paragraphs.forEach((para, pi) => {
    const words = para.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
      } else {
        if (line) out.push(line);
        // palavra maior que a linha inteira: quebra por caracteres
        if (ctx.measureText(word).width > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            if (ctx.measureText(chunk + ch).width > maxWidth) {
              out.push(chunk);
              chunk = ch;
            } else chunk += ch;
          }
          line = chunk;
        } else line = word;
      }
    }
    if (line) out.push(line);
    if (pi < paragraphs.length - 1) out.push('');
  });
  return out;
}

/** Procura o maior tamanho de fonte (entre max e min) em que o texto cabe na caixa. */
export function fitText(ctx: Measurer, text: string, maxWidth: number, maxHeight: number, maxSize: number, minSize: number, family = SERIF): TextLayout | null {
  for (let size = maxSize; size >= minSize; size -= 2) {
    ctx.font = `${size}px ${family}`;
    const lineHeight = Math.round(size * 1.38);
    const lines = wrapText(ctx, text, maxWidth);
    if (lines.length * lineHeight <= maxHeight) return { lines, size, lineHeight };
  }
  return null;
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  const w = r * 0.17;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + w, cy - w);
  ctx.lineTo(cx + r * 0.85, cy);
  ctx.lineTo(cx + w, cy + w);
  ctx.lineTo(cx, cy + r * 1.3);
  ctx.lineTo(cx - w, cy + w);
  ctx.lineTo(cx - r * 0.85, cy);
  ctx.lineTo(cx - w, cy - w);
  ctx.closePath();
  ctx.fill();
}

/** Moldura em arco (vitral) com filete dourado: retângulo com topo em semicírculo achatado. */
function archPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, archH: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + archH);
  ctx.bezierCurveTo(x, y + archH * 0.15, x + w * 0.22, y, x + w / 2, y);
  ctx.bezierCurveTo(x + w * 0.78, y, x + w, y + archH * 0.15, x + w, y + archH);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
  // letterSpacing é suportado nos navegadores atuais; nos antigos, é ignorado sem erro.
  (ctx as unknown as { letterSpacing?: string }).letterSpacing = `${px}px`;
}

/**
 * Desenha o cartão. Retorna false se o texto não couber neste formato.
 * `bg` (opcional): ilustração do céu de Belém, desenhada ao fundo com véu escuro para garantir contraste.
 */
export function drawCard(ctx: CanvasRenderingContext2D, format: CardFormat, content: CardContent, bg?: CanvasImageSource & { width: number; height: number }): boolean {
  const { w, h } = CARD_FORMATS[format];
  const pad = 104;

  // Horizonte de Belém (ilustração do Canva): só a faixa das colinas e da cidade, sem a estrela,
  // que já é desenhada no topo. A faixa entra suavemente sobre o fundo, sem emenda.
  const crop = bg && bg.width > 0 ? { sy: bg.height * 0.6, sh: bg.height * 0.4 } : null;
  const bandH = crop && bg ? Math.round((w / bg.width) * crop.sh * 1.25) : 0;
  const bandTop = h - bandH;

  // Fundo: noite do Advento, terminando exatamente na cor da noite onde a faixa começa
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#4B2C66');
  g.addColorStop(crop ? Math.max(0.3, bandTop / h) : 1, '#2E1A40');
  g.addColorStop(1, '#2E1A40');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  if (crop && bg) {
    const dw = bandH * (bg.width / crop.sh);
    ctx.globalAlpha = 0.85;
    ctx.drawImage(bg, 0, crop.sy, bg.width, crop.sh, (w - dw) / 2, bandTop, dw, bandH);
    ctx.globalAlpha = 1;
    // funde o topo da faixa com o fundo e escurece a base para o rodapé ficar legível
    const fade = ctx.createLinearGradient(0, bandTop, 0, h);
    fade.addColorStop(0, 'rgba(46,26,64,1)');
    fade.addColorStop(0.35, 'rgba(46,26,64,0.15)');
    fade.addColorStop(0.7, 'rgba(46,26,64,0.35)');
    fade.addColorStop(1, 'rgba(46,26,64,0.8)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, bandTop, w, bandH);
  }

  // Moldura em arco com filete dourado
  const fx = 52;
  const fy = 52;
  archPath(ctx, fx, fy, w - fx * 2, h - fy * 2, Math.min(260, (w - fx * 2) * 0.32));
  ctx.strokeStyle = 'rgba(215,177,91,0.7)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Estrela de Belém com brilho
  const sy = fy + 150;
  const glow = ctx.createRadialGradient(w / 2, sy, 8, w / 2, sy, 200);
  glow.addColorStop(0, 'rgba(255,231,166,0.42)');
  glow.addColorStop(1, 'rgba(255,231,166,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(w / 2 - 220, sy - 220, 440, 440);
  drawStar(ctx, w / 2, sy, 62, '#D7B15B');
  drawStar(ctx, w / 2, sy, 28, '#FFF3D1');

  let y = sy + 120;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  ctx.fillStyle = '#D7B15B';
  ctx.font = `800 30px ${SANS}`;
  setSpacing(ctx, 6);
  ctx.fillText(content.kicker.toUpperCase(), w / 2, y);
  setSpacing(ctx, 0);
  y += 62;

  if (content.title) {
    const t = fitText(ctx, content.title, w - pad * 2, 170, 72, 46, DISPLAY);
    if (t) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `600 ${t.size}px ${DISPLAY}`;
      for (const line of t.lines) {
        ctx.fillText(line, w / 2, y);
        y += Math.round(t.size * 1.12);
      }
      y += 26;
    }
  }

  const footerH = 160;
  const boxH = h - y - footerH - pad / 2;
  const isQuote = content.body.trim().startsWith('“');
  const maxSize = format === 'story' ? 56 : 52;
  // Mede com a versão regular (um pouco mais larga que a itálica): o texto desenhado nunca transborda.
  const body = fitText(ctx, content.body, w - pad * 2, boxH, maxSize, 26, SERIF);
  if (!body) return false;

  ctx.fillStyle = '#F8F3E9';
  ctx.font = `${isQuote ? 'italic ' : ''}${body.size}px ${SERIF}`;
  let by = y + Math.max(0, (boxH - body.lines.length * body.lineHeight) / 2);
  for (const line of body.lines) {
    ctx.fillText(line, w / 2, by);
    by += body.lineHeight;
  }

  // Rodapé: ornamento, referência e assinatura discreta
  const oy = h - footerH - 6;
  ctx.fillStyle = 'rgba(215,177,91,0.75)';
  ctx.fillRect(w / 2 - 130, oy, 100, 2);
  ctx.fillRect(w / 2 + 30, oy, 100, 2);
  drawStar(ctx, w / 2, oy + 1, 12, '#D7B15B');
  if (content.footer) {
    ctx.fillStyle = 'rgba(248,243,233,0.88)';
    ctx.font = `600 27px ${SANS}`;
    ctx.fillText(content.footer, w / 2, h - footerH + 30);
  }
  ctx.fillStyle = '#D7B15B';
  ctx.font = `italic 500 38px ${DISPLAY}`;
  ctx.fillText('Caminho até Belém', w / 2, h - footerH + 74);
  return true;
}

let bgPromise: Promise<HTMLImageElement | null> | null = null;
function loadBackground(): Promise<HTMLImageElement | null> {
  bgPromise ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = '/ilustracoes/ceu.webp';
  });
  return bgPromise;
}

/** Garante que as fontes da identidade estejam carregadas antes de medir e desenhar o texto. */
async function ensureFonts() {
  if (typeof document === 'undefined' || !document.fonts?.load) return;
  await Promise.all(
    ['800 30px "Nunito Sans"', '600 27px "Nunito Sans"', '600 60px "Cormorant Garamond"', 'italic 500 38px "Cormorant Garamond"', '40px "Literata"', 'italic 40px "Literata"'].map((f) =>
      document.fonts.load(f).catch(() => []),
    ),
  );
}

export async function renderCard(format: CardFormat, content: CardContent): Promise<Blob | null> {
  const { w, h } = CARD_FORMATS[format];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Seu navegador não conseguiu desenhar o cartão.');
  const [bg] = await Promise.all([loadBackground(), ensureFonts()]);
  if (!drawCard(ctx, format, content, bg ?? undefined)) return null;
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar a imagem.'))), 'image/png'),
  );
}

