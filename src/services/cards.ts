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

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Segoe UI', Roboto, Arial, sans-serif";

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

/** Desenha o cartão. Retorna false se o texto não couber neste formato. */
export function drawCard(ctx: CanvasRenderingContext2D, format: CardFormat, content: CardContent): boolean {
  const { w, h } = CARD_FORMATS[format];
  const pad = 96;

  // Fundo: roxo do Advento em degradê suave, com moldura dourada discreta
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#60377D');
  g.addColorStop(1, '#3B1F52');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(215,177,91,0.55)';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, w - 80, h - 80);

  // Brilho e estrela de Belém
  const glow = ctx.createRadialGradient(w / 2, pad + 90, 10, w / 2, pad + 90, 220);
  glow.addColorStop(0, 'rgba(248,243,233,0.35)');
  glow.addColorStop(1, 'rgba(248,243,233,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, pad + 330);
  drawStar(ctx, w / 2, pad + 70, 70, '#D7B15B');
  drawStar(ctx, w / 2, pad + 70, 34, '#F8F3E9');

  let y = pad + 210;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  ctx.fillStyle = '#D7B15B';
  ctx.font = `600 34px ${SANS}`;
  ctx.fillText(content.kicker.toUpperCase(), w / 2, y);
  y += 64;

  if (content.title) {
    const t = fitText(ctx, content.title, w - pad * 2, 160, 58, 40, SERIF);
    ctx.fillStyle = '#FFFFFF';
    if (t) {
      ctx.font = `bold ${t.size}px ${SERIF}`;
      for (const line of t.lines) {
        ctx.fillText(line, w / 2, y);
        y += t.lineHeight;
      }
      y += 24;
    }
  }

  const footerH = 150;
  const boxH = h - y - footerH - pad / 2;
  const maxSize = format === 'story' ? 54 : 50;
  const body = fitText(ctx, content.body, w - pad * 2, boxH, maxSize, 26, SERIF);
  if (!body) return false;

  ctx.fillStyle = '#F8F3E9';
  ctx.font = `${body.size}px ${SERIF}`;
  // centraliza o bloco verticalmente na área disponível
  let by = y + Math.max(0, (boxH - body.lines.length * body.lineHeight) / 2);
  for (const line of body.lines) {
    ctx.fillText(line, w / 2, by);
    by += body.lineHeight;
  }

  // Rodapé com assinatura discreta
  ctx.fillStyle = 'rgba(215,177,91,0.8)';
  ctx.fillRect(w / 2 - 60, h - footerH - 8, 120, 3);
  if (content.footer) {
    ctx.fillStyle = 'rgba(248,243,233,0.85)';
    ctx.font = `28px ${SANS}`;
    ctx.fillText(content.footer, w / 2, h - footerH + 20);
  }
  ctx.fillStyle = '#D7B15B';
  ctx.font = `italic 32px ${SERIF}`;
  ctx.fillText('Caminho até Belém', w / 2, h - footerH + 66);
  return true;
}

export async function renderCard(format: CardFormat, content: CardContent): Promise<Blob | null> {
  const { w, h } = CARD_FORMATS[format];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Seu navegador não conseguiu desenhar o cartão.');
  if (!drawCard(ctx, format, content)) return null;
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar a imagem.'))), 'image/png'),
  );
}
