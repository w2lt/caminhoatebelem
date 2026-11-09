// Converte as ilustrações exportadas do Canva (PNG) em WebP leves para o app, usando o Chrome instalado.
// Uso: node scripts/optimize-illustrations.mjs <pasta-com-pngs>
// Gera public/ilustracoes/{ceu,coroa,presepio}.webp
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const src = process.argv[2];
if (!src) throw new Error('Informe a pasta com ceu.png, coroa.png e presepio.png');
const OUT = 'public/ilustracoes';
mkdirSync(OUT, { recursive: true });

const jobs = [
  { name: 'ceu', width: 1280, quality: 0.82 },
  { name: 'coroa', width: 720, quality: 0.85 },
  { name: 'presepio', width: 720, quality: 0.85 },
];

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
for (const j of jobs) {
  const b64 = readFileSync(join(src, `${j.name}.png`)).toString('base64');
  const out = await page.evaluate(async ({ b64, width, quality }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const h = Math.round((img.naturalHeight / img.naturalWidth) * width);
    const c = document.createElement('canvas');
    c.width = width;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, h);
    return { data: c.toDataURL('image/webp', quality).split(',')[1], h };
  }, { b64, width: j.width, quality: j.quality });
  const buf = Buffer.from(out.data, 'base64');
  writeFileSync(join(OUT, `${j.name}.webp`), buf);
  console.log(`${j.name}.webp ${j.width}x${out.h} ${(buf.length / 1024).toFixed(0)} KB`);
}
await browser.close();
