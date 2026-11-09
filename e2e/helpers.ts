import { expect, type Page } from '@playwright/test';

/** Primeiro uso pelo app (sem cadastro), simulando a data informada com ?hoje=. */
export async function onboard(page: Page, hoje = '2026-12-13') {
  await page.goto(`/?hoje=${hoje}`);
  await page.getByRole('button', { name: 'Começar' }).click();
  await page.getByRole('button', { name: 'Normal' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  const cont = page.getByRole('button', { name: 'Continuar' });
  if (await cont.isVisible().catch(() => false)) await cont.click();
  await page.getByRole('button', { name: 'Iniciar a jornada' }).click();
  await expect(page.getByRole('heading', { name: 'Meu Advento' })).toBeVisible();
}

/** Gera um PDF mínimo e válido (1 página com texto) para testar a importação. */
export function tinyPdf(text = 'Novena do Circulo Biblico'): Buffer {
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  const stream = `BT /F1 14 Tf 20 100 Td (${text}) Tj ET`;
  objs[3] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) out += `${String(off).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}
