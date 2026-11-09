// Captura telas reais do app (celular, 390×844 @2x) para a apresentação.
// Uso: node scripts/capture-screens.mjs [url-base]
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.argv[2] || 'https://caminhoatebelem.warleson-dbrandao.workers.dev';
const OUT = process.argv[3] || 'docs/apresentacao/telas';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'pt-BR',
  timezoneId: 'America/Sao_Paulo',
});
const page = await ctx.newPage();

// Primeiro uso (sem cadastro), simulando o Domingo Gaudete (13/12/2026) pela manhã
await page.clock.setFixedTime(new Date('2026-12-13T08:00:00-03:00'));
await page.goto(`${BASE}/?hoje=2026-12-13`);
await page.getByRole('button', { name: 'Começar' }).click();
await page.getByRole('button', { name: 'Normal' }).click();
await page.getByRole('button', { name: 'Continuar' }).click();
const cont = page.getByRole('button', { name: 'Continuar' });
if (await cont.isVisible().catch(() => false)) await cont.click();
await page.getByRole('button', { name: 'Iniciar a jornada' }).click();
await page.getByRole('navigation', { name: 'Atalhos do dia' }).waitFor();

async function shot(path, name, prep) {
  await page.goto(`${BASE}${path}`);
  await page.waitForLoadState('networkidle');
  if (prep) await prep();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('tela', name);
}

await shot('/', 'inicio');
await shot('/dia/2026-12-13', 'oracao');
await shot('/liturgia/2026-12-13', 'liturgia');
await shot('/novena', 'novena');
await shot('/novena/5', 'encontro');
await shot('/circulo', 'circulo');
await shot('/coroa', 'coroa');
await shot('/mais', 'mais');
await shot('/rezar', 'rezar');
await shot('/presepio', 'presepio');
await shot('/agenda/novo', 'agenda-form');

// Cartão de compartilhamento gerado pelo app (1080×1350)
await page.goto(`${BASE}/dia/2026-12-13#frase`);
await page.getByRole('button', { name: 'Compartilhar' }).first().click();
const dialog = page.getByRole('dialog', { name: 'Compartilhar' });
await dialog.getByText('4:5', { exact: true }).click();
const img = dialog.getByRole('img', { name: /Cartão/ });
await img.waitFor();
await page.waitForTimeout(500);
// (a CSP do app bloqueia fetch de blob:, então copiamos a imagem via canvas)
const b64 = await img.evaluate((el) => {
  const c = document.createElement('canvas');
  c.width = el.naturalWidth;
  c.height = el.naturalHeight;
  c.getContext('2d').drawImage(el, 0, 0);
  return c.toDataURL('image/png').split(',')[1];
});
writeFileSync(`${OUT}/cartao.png`, Buffer.from(b64, 'base64'));
console.log('tela cartao');

await browser.close();
