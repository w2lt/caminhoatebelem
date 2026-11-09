import { describe, expect, it, vi } from 'vitest';
import { buildIcs, escapeIcs, foldLine } from './ics';
import { fitText, wrapText, type Measurer } from './cards';
import { createBackup, parseBackup, restoreBackup, BackupError } from './backup';
import { hasPdfSignature, precheckPdf, sanitizeFileName, PdfImportError, MAX_PDF_BYTES } from './pdf';
import { plannedReminders, remindersToIcs } from './reminders';
import { shareText, withSignature, whatsappUrl, slug } from './share';
import { DEFAULT_REMINDERS } from '../db/settings';
import { db } from '../db/database';
import { createEvent, EMPTY_EVENT } from '../db/events';
import { addIntention } from '../db/progress';
import { readBytes } from '../lib/bytes';

/** Medidor determinístico: cada caractere ocupa (tamanho da fonte × 0,5) px. */
function fakeCtx(): Measurer {
  const ctx = {
    font: '20px serif',
    measureText(t: string) {
      const size = Number(/(\d+)px/.exec(ctx.font)?.[1] ?? 20);
      return { width: t.length * size * 0.5 };
    },
  };
  return ctx;
}

describe('ICS', () => {
  it('escapa caracteres especiais e dobra linhas longas', () => {
    expect(escapeIcs('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
    const folded = foldLine('DESCRIPTION:' + 'á'.repeat(80));
    expect(folded.split('\r\n').every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true);
  });

  it('gera evento com horário, alarme e evento de dia inteiro', () => {
    const ics = buildIcs(
      [
        { uid: '1', title: 'Missa da Noite de Natal', date: '2026-12-24', time: '22:00', location: 'Matriz, Centro', alarmMinutes: 60 },
        { uid: '2', title: 'Montar o presépio', date: '2026-11-29' },
      ],
      new Date('2026-11-08T12:00:00Z'),
    );
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('DTSTART:20261224T220000');
    expect(ics).toContain('DTEND:20261224T230000');
    expect(ics).toContain('LOCATION:Matriz\\, Centro');
    expect(ics).toContain('TRIGGER:-PT60M');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261129');
    expect(ics).toContain('DTEND;VALUE=DATE:20261130');
    expect(ics.split('\r\n').filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(2);
  });

  it('evento que atravessa a meia-noite termina no dia seguinte', () => {
    expect(buildIcs([{ uid: 'x', title: 'Vigília', date: '2026-12-24', time: '23:30', durationMinutes: 90 }])).toContain('DTEND:20261225T010000');
  });
});

describe('cartões: o texto se ajusta sem cortes', () => {
  it('quebra em linhas que cabem na largura', () => {
    const ctx = fakeCtx();
    ctx.font = '20px serif';
    const lines = wrapText(ctx, 'Senhor, hoje começa o Advento e eu quero começar contigo.', 200);
    expect(lines.every((l) => ctx.measureText(l).width <= 200)).toBe(true);
    expect(lines.join(' ')).toBe('Senhor, hoje começa o Advento e eu quero começar contigo.');
  });

  it('diminui a fonte até caber; devolve null se não couber no mínimo', () => {
    const ctx = fakeCtx();
    const longo = 'palavra '.repeat(200);
    const fit = fitText(ctx, longo, 888, 1400, 54, 26);
    expect(fit).not.toBeNull();
    expect(fit!.lines.length * fit!.lineHeight).toBeLessThanOrEqual(1400);
    expect(fitText(ctx, 'palavra '.repeat(3000), 888, 300, 54, 26)).toBeNull();
  });

  it('palavras enormes são quebradas sem ultrapassar a largura', () => {
    const ctx = fakeCtx();
    ctx.font = '20px serif';
    expect(wrapText(ctx, 'x'.repeat(100), 100).every((l) => ctx.measureText(l).width <= 100)).toBe(true);
  });
});

describe('compartilhamento', () => {
  it('assina o texto e monta link do WhatsApp', () => {
    expect(withSignature('Oração')).toBe('Oração\n\n— Caminho até Belém');
    expect(whatsappUrl('a b&c')).toBe('https://wa.me/?text=a%20b%26c');
    expect(slug('Oração da Manhã — 1º dia!')).toBe('oracao-da-manha-1-dia');
  });

  it('usa a Web Share API quando existe; senão copia', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });
    expect(await shareText('t', 'x')).toBe('shared');
    Object.assign(navigator, { share: undefined, clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    expect(await shareText('t', 'x')).toBe('copied');
  });

  it('cancelamento do usuário não vira erro', async () => {
    Object.assign(navigator, { share: vi.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' })) });
    expect(await shareText('t', 'x')).toBe('cancelled');
    Object.assign(navigator, { share: undefined });
  });
});

describe('importação de PDF (validações)', () => {
  const pdfBytes = new TextEncoder().encode('%PDF-1.4\n%âãÏÓ\n1 0 obj<<>>endobj\n%%EOF');

  it('reconhece a assinatura %PDF-', async () => {
    expect(await hasPdfSignature(new Blob([pdfBytes]))).toBe(true);
    expect(await hasPdfSignature(new Blob(['<html>não sou pdf</html>']))).toBe(false);
  });

  it('rejeita tipo errado, vazio, grande demais e conteúdo falso', async () => {
    await expect(precheckPdf(new File(['x'], 'foto.jpg', { type: 'image/jpeg' }))).rejects.toThrow(PdfImportError);
    await expect(precheckPdf(new File([], 'vazio.pdf', { type: 'application/pdf' }))).rejects.toThrow('vazio');
    const big = new File([new Uint8Array(MAX_PDF_BYTES + 1)], 'grande.pdf', { type: 'application/pdf' });
    await expect(precheckPdf(big)).rejects.toThrow('20 MB');
    await expect(precheckPdf(new File(['<script>alert(1)</script>'], 'falso.pdf', { type: 'application/pdf' }))).rejects.toThrow('não é um PDF válido');
    await expect(precheckPdf(new File([pdfBytes], 'novena.pdf', { type: 'application/pdf' }))).resolves.toBeUndefined();
  });

  it('limpa o nome do arquivo', () => {
    expect(sanitizeFileName('<img src=x onerror=alert(1)>.pdf')).toBe('img srcx onerroralert(1).pdf');
    expect(sanitizeFileName('.pdf')).toBe('novena.pdf');
  });
});

describe('backup e restauração', () => {
  it('ida e volta preserva agenda, intenções e PDF', async () => {
    await createEvent({ ...EMPTY_EVENT, title: 'Ensaio do coral', date: '2026-12-10', time: '20:00' });
    await addIntention('Pela paz', 0);
    await db.pdfs.add({ id: 'p1', name: 'novena.pdf', size: 4, pages: 1, blob: new Blob([new Uint8Array([37, 80, 68, 70])], { type: 'application/pdf' }), addedAt: 1 });
    await db.license.put({ id: 'license', token: 'segredo', activatedAt: 1, deviceId: 'd' });

    const { json, filename } = await createBackup();
    expect(filename).toMatch(/^caminho-ate-belem-backup-\d{4}-\d{2}-\d{2}\.json$/);
    expect(json).not.toContain('segredo'); // licença comercial fica fora do backup

    await db.events.clear();
    await db.intentions.clear();
    await db.pdfs.clear();
    const summary = await restoreBackup(json);
    expect(summary).toMatchObject({ events: 1, intentions: 1, pdfs: 1 });
    expect((await db.events.toArray())[0]?.title).toBe('Ensaio do coral');
    const pdf = await db.pdfs.get('p1');
    expect(new Uint8Array(await readBytes(pdf!.blob))).toEqual(new Uint8Array([37, 80, 68, 70]));
  });

  it('rejeita arquivo estranho, alterado ou de versão futura sem tocar nos dados', async () => {
    await createEvent({ ...EMPTY_EVENT, title: 'Fica', date: '2026-12-10' });
    await expect(restoreBackup('não é json')).rejects.toThrow(BackupError);
    await expect(restoreBackup('{"format":"outro"}')).rejects.toThrow('não é um backup');

    const { json } = await createBackup();
    const tampered = json.replace('Fica', 'Mudou');
    await expect(restoreBackup(tampered)).rejects.toThrow('alterado');

    const future = JSON.parse(json);
    future.version = 99;
    await expect(parseBackup(JSON.stringify(future))).rejects.toThrow('versão mais nova');
    expect((await db.events.toArray())[0]?.title).toBe('Fica');
  });
});

describe('lembretes', () => {
  it('monta a lista conforme as preferências e exporta em ICS', async () => {
    const ev = await createEvent({ ...EMPTY_EVENT, title: 'Missa da Noite', category: 'missa-natal', date: '2026-12-24', time: '22:00', reminderMinutes: 60 });
    const prefs = { ...DEFAULT_REMINDERS, manha: { on: true, time: '07:00' }, coroa: { on: true, time: '19:00' }, novena: { on: true, time: '19:30' }, missas: { on: true } };
    const list = plannedReminders(prefs, 2026, [ev], null, '2026-12-10');
    expect(list.find((r) => r.id === 'manha')).toMatchObject({ date: '2026-12-10', dailyUntil: '2026-12-25' });
    expect(list.filter((r) => r.kind === 'coroa').map((r) => r.date)).toEqual(['2026-12-13', '2026-12-20']);
    expect(list.filter((r) => r.kind === 'novena')).toHaveLength(9);
    expect(list.find((r) => r.kind === 'missas')).toMatchObject({ time: '22:00', alarmMinutes: 60 });
    const ics = buildIcs(remindersToIcs(list));
    expect(ics).toContain('RRULE:FREQ=DAILY;UNTIL=20261225T235959');
  });

  it('nada é planejado quando tudo está desligado', () => {
    expect(plannedReminders(DEFAULT_REMINDERS, 2026, [], null, '2026-11-08')).toEqual([]);
  });
});
