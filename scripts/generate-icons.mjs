// Gera os ícones PNG do PWA (sem dependências externas) a partir do mesmo desenho de public/icon.svg.
// Uso: npm run icons
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const PURPLE = [0x60, 0x37, 0x7d];
const GLOW = [0x7a, 0x4d, 0x99];
const GOLD = [0xd7, 0xb1, 0x5b];
const CREAM = [0xf8, 0xf3, 0xe9];

function inRoundRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

/** Estrela de 4 pontas em (cx, cy): braço de cima, de baixo, laterais e "cintura" w. */
function inStar(u, v, cx, cy, top, bottom, side, w) {
  const dx = Math.abs(u - cx);
  const dy = v - cy;
  const len = dy < 0 ? top : bottom;
  return dx / w + Math.abs(dy) / len <= 1 || Math.abs(dy) / w + dx / side <= 1;
}

function shade(x, y, { rounded, scale }) {
  if (rounded && !inRoundRect(x, y, 0, 0, 512, 512, 112)) return null;
  const u = 256 + (x - 256) / scale;
  const v = 256 + (y - 256) / scale;
  let color = PURPLE;
  if ((u - 256) ** 2 + (v - 230) ** 2 <= 120 * 120) color = GLOW;
  if (inStar(u, v, 256, 230, 160, 210, 136, 26)) color = GOLD;
  if (inStar(u, v, 256, 230, 80, 100, 80, 15)) color = CREAM;
  return color;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(size, options) {
  const SS = 4;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let py = 0; py < size; py++) {
    raw[py * (size * 4 + 1)] = 0;
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = shade(((px + (sx + 0.5) / SS) / size) * 512, ((py + (sy + 0.5) / SS) / size) * 512, options);
          if (c) { r += c[0]; g += c[1]; b += c[2]; a += 255; }
        }
      }
      const n = SS * SS;
      const o = py * (size * 4 + 1) + 1 + px * 4;
      const alpha = a / n;
      raw[o] = alpha ? Math.round((r / n) * (255 / alpha)) : 0;
      raw[o + 1] = alpha ? Math.round((g / n) * (255 / alpha)) : 0;
      raw[o + 2] = alpha ? Math.round((b / n) * (255 / alpha)) : 0;
      raw[o + 3] = Math.round(alpha);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [file, size, opts] of [
  ['public/pwa-192x192.png', 192, { rounded: true, scale: 1 }],
  ['public/pwa-512x512.png', 512, { rounded: true, scale: 1 }],
  ['public/maskable-512x512.png', 512, { rounded: false, scale: 0.78 }],
  ['public/apple-touch-icon.png', 180, { rounded: false, scale: 0.86 }],
]) {
  writeFileSync(file, png(size, opts));
  console.log('gerado', file);
}
