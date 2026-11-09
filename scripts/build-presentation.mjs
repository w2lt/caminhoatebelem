// Gera o PDF da apresentação a partir de docs/apresentacao/apresentacao.html (Chrome instalado).
// Uso: node scripts/build-presentation.mjs
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const html = resolve('docs/apresentacao/apresentacao.html');
const out = resolve('docs/apresentacao/Caminho-ate-Belem-Apresentacao-Paroquia.pdf');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
await page.pdf({ path: out, width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('PDF gerado:', out);
