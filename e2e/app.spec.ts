import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { onboard, tinyPdf } from './helpers';

test.describe('Caminho até Belém — fluxos principais', () => {
  test('boas-vindas sem cadastro e tela inicial do Domingo Gaudete', async ({ page }) => {
    await onboard(page, '2026-12-13');
    await expect(page.getByRole('heading', { name: '3º Domingo do Advento', level: 1 })).toBeVisible();
    await expect(page.getByText('Gaudete · Alegrai-vos')).toBeVisible();
    await expect(page.locator('header strong')).toHaveText('12');
    await expect(page.getByText(/dias para\s*o Natal/)).toBeVisible();
    await expect(page.getByRole('img', { name: '3 de 4 velas da coroa acesas' })).toBeVisible();
    await expect(page.getByText('Cor litúrgica: Rosa')).toBeVisible();
    await expect(page.getByRole('link', { name: /Liturgia\s*Jo 1,6-8\.19-28/ })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link')).toHaveCount(4);
  });

  test('antes do Advento mostra contagem e preparação', async ({ page }) => {
    await onboard(page, '2026-11-08');
    await expect(page.locator('header strong')).toHaveText('21');
    await expect(page.getByText(/dias para o\s*Advento/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prepare-se para o Advento' })).toBeVisible();
  });

  test('oração do dia: abas, marcar como rezada persiste; fonte ajustável na leitura', async ({ page }) => {
    await onboard(page, '2026-12-01');
    await page.goto('/dia/2026-12-01');
    await expect(page.getByRole('heading', { name: 'Um broto de esperança' })).toBeVisible();
    const marcar = page.getByRole('button', { name: 'Marcar como rezada' }).first();
    await marcar.click();
    await expect(page.getByRole('button', { name: 'Rezei' }).first()).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('tab', { name: /Manhã/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: 'Manhã (feito)' })).toBeVisible();
    await page.getByRole('tab', { name: 'Noite' }).click();
    await expect(page).toHaveURL(/#noite$/);
    await expect(page.getByRole('tabpanel')).toContainText('Oração para encerrar o dia');
    await page.getByRole('tab', { name: 'Noite' }).press('ArrowLeft');
    await expect(page.getByRole('tab', { name: 'Gesto' })).toBeFocused();
    await expect(page.getByRole('tabpanel')).toContainText('Gesto concreto');
    await page.goto('/dia/2026-12-01#manha');
    await page.getByRole('button', { name: 'Aumentar o texto' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-font', 'grande');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Rezei' }).first()).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-font', 'grande');
  });

  test('compartilhar: cartão local nos três formatos e cópia de texto', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await onboard(page, '2026-12-13');
    await page.goto('/dia/2026-12-13');
    await page.getByRole('button', { name: 'Compartilhar' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Compartilhar' });
    await expect(dialog.getByRole('img', { name: /Cartão: Oração da manhã/ })).toBeVisible();
    for (const f of ['4:5', '1:1']) {
      await dialog.getByText(f, { exact: true }).click();
      await expect(dialog.getByRole('img', { name: /Cartão/ }).or(dialog.getByText(/longo demais/))).toBeVisible();
    }
    const size = await dialog.getByRole('img', { name: /Cartão/ }).evaluate((img: HTMLImageElement) => `${img.naturalWidth}x${img.naturalHeight}`).catch(() => null);
    if (size) expect(size).toBe('1080x1080');
    await dialog.getByRole('button', { name: 'Copiar' }).click();
    await expect(page.getByText('Texto copiado.')).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain('— Caminho até Belém');
  });

  test('liturgia: referências, cor e aviso de direitos com links oficiais', async ({ page }) => {
    await onboard(page, '2026-12-25');
    await page.goto('/liturgia/2026-12-25');
    await expect(page.getByRole('heading', { name: 'Natal do Senhor' })).toBeVisible();
    for (const m of ['Missa da Noite', 'Missa da Aurora', 'Missa do Dia']) await expect(page.getByRole('heading', { name: m })).toBeVisible();
    await expect(page.getByText('Jo 1,1-18')).toBeVisible();
    await expect(page.getByRole('link', { name: /Vatican News/ })).toHaveAttribute('href', /2026\/12\/25/);
  });

  test('agenda: criar, destacar próximo, editar e excluir com confirmação', async ({ page }) => {
    await onboard(page, '2026-12-01');
    await page.goto('/agenda/novo');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Informe um título')).toBeVisible();
    await expect(page.getByLabel('Título *')).toBeFocused();

    await page.getByLabel('Título *').fill('Confissões na Matriz');
    await page.getByLabel('Categoria').selectOption('confissao');
    await page.getByLabel('Data *').fill('2027-12-10');
    await page.getByLabel('Horário').fill('19:00');
    await page.getByLabel('Local').fill('Igreja Matriz');
    await page.getByLabel('Lembrete').selectOption('60');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Atividade salva na agenda.')).toBeVisible();
    await expect(page.getByText('Próximo compromisso')).toBeVisible();

    await page.getByRole('link', { name: /Confissões na Matriz/ }).click();
    await page.getByLabel('Título *').fill('Mutirão de confissões');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('link', { name: /Mutirão de confissões/ })).toBeVisible();

    await page.getByRole('link', { name: /Mutirão de confissões/ }).click();
    await page.getByRole('button', { name: 'Excluir atividade' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Sua agenda está vazia.')).toBeVisible();
  });

  test('Missas de Natal: cadastro a partir do atalho e exportação ICS', async ({ page }) => {
    await onboard(page, '2026-12-20');
    await page.goto('/missas');
    await page.getByRole('link', { name: 'Missa da Noite de Natal' }).click();
    await expect(page.getByLabel('Data *')).toHaveValue('2026-12-24');
    await page.getByLabel('Horário').fill('22:00');
    await page.getByLabel('Nome da igreja').fill('Paróquia São José');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Paróquia São José')).toBeVisible();

    await page.goto('/agenda');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Calendário' }).click();
    const file = await (await download).path();
    const ics = readFileSync(file!, 'utf8');
    expect(ics).toContain('DTSTART:20261224T220000');
    expect(ics).toContain('SUMMARY:Missa da Noite de Natal');
  });

  test('novena: encontro realizado, progresso e intenção local', async ({ page }) => {
    await onboard(page, '2026-12-16');
    await page.goto('/novena/1');
    await expect(page.getByRole('heading', { name: '1º encontro: A promessa' })).toBeVisible();
    await page.getByLabel('Acrescentar uma intenção (opcional)').fill('Pela saúde da vovó Ana');
    await page.getByRole('button', { name: 'Guardar intenção' }).click();
    await expect(page.getByText('— Pela saúde da vovó Ana')).toBeVisible();
    await page.getByRole('button', { name: 'Marcar encontro realizado' }).first().click();
    await page.goto('/novena');
    await expect(page.getByText('1 de 9 realizados')).toBeVisible();
    // trocar de modalidade não apaga o progresso
    await page.getByText('Círculo Bíblico', { exact: true }).click();
    await page.getByText('Novena do app', { exact: true }).click();
    await expect(page.getByText('1 de 9 realizados')).toBeVisible();
  });

  test('Círculo Bíblico: cadastro, PDF válido offline e PDF inválido rejeitado', async ({ page, context }) => {
    await onboard(page, '2026-12-16');
    await page.goto('/circulo');
    await page.getByLabel('Nome do Círculo Bíblico').fill('Círculo Sagrada Família');
    await page.getByRole('button', { name: /^1º encontro/ }).click();
    await page.getByLabel('Família ou responsável').fill('Família Souza');
    await page.getByRole('button', { name: 'Salvar novena do Círculo' }).click();
    await expect(page.getByText('Novena do Círculo salva.')).toBeVisible();

    await page.locator('#pdf-input').setInputFiles({ name: 'falso.pdf', mimeType: 'application/pdf', buffer: Buffer.from('<script>alert(1)</script>') });
    await expect(page.getByRole('alert')).toContainText('não é um PDF válido');

    await page.locator('#pdf-input').setInputFiles({ name: 'novena-comunidade.pdf', mimeType: 'application/pdf', buffer: tinyPdf() });
    await expect(page.getByText(/importado \(1 páginas\)/)).toBeVisible();

    await page.reload();
    await expect(page.getByLabel('Nome do Círculo Bíblico')).toHaveValue('Círculo Sagrada Família');
    await context.setOffline(true);
    await page.getByRole('link', { name: /novena-comunidade\.pdf/ }).click();
    await expect(page.getByRole('img', { name: 'Página 1 de 1' })).toBeVisible();
    await page.getByRole('button', { name: 'Ver como texto' }).click();
    await expect(page.getByText('Novena do Circulo Biblico')).toBeVisible();
    await context.setOffline(false);
  });

  test('backup: exportar e restaurar com validação', async ({ page }) => {
    await onboard(page, '2026-12-01');
    await page.goto('/agenda/novo');
    await page.getByLabel('Título *').fill('Ensaio do coral');
    await page.getByLabel('Data *').fill('2027-12-05');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Atividade salva na agenda.')).toBeVisible();

    await page.goto('/backup');
    const dl = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Fazer backup agora' }).click();
    const path = await (await dl).path();
    const json = readFileSync(path!, 'utf8');
    expect(JSON.parse(json).format).toBe('caminho-ate-belem-backup');

    await page.locator('#backup-input').setInputFiles({ name: 'ruim.json', mimeType: 'application/json', buffer: Buffer.from('{"x":1}') });
    await expect(page.getByRole('alert')).toContainText('não é um backup');

    // apaga a atividade e restaura
    await page.evaluate(async () => {
      await new Promise<void>((res, rej) => {
        const r = indexedDB.open('caminho-ate-belem');
        r.onsuccess = () => {
          const tx = r.result.transaction('events', 'readwrite');
          tx.objectStore('events').clear();
          tx.oncomplete = () => {
            r.result.close();
            res();
          };
        };
        r.onerror = () => rej(r.error);
      });
    });
    await page.locator('#backup-input').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(json) });
    await page.getByRole('button', { name: 'Restaurar e substituir' }).click();
    await expect(page.getByText('Backup restaurado com sucesso.')).toBeVisible();
    await page.goto('/agenda');
    await expect(page.getByText('Ensaio do coral')).toBeVisible();
  });

  test('lembretes: exportação ICS com os itens ligados', async ({ page }) => {
    await onboard(page, '2026-12-01');
    await page.goto('/lembretes');
    await page.getByRole('switch', { name: /Oração da manhã/ }).click();
    await page.getByRole('switch', { name: /Novena de Natal/ }).click();
    const dl = page.waitForEvent('download');
    await page.getByRole('button', { name: /Adicionar 10 lembretes ao calendário/ }).click();
    const ics = readFileSync((await (await dl).path())!, 'utf8');
    expect(ics).toContain('RRULE:FREQ=DAILY');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(10);
  });
});

test.describe('PWA, offline, responsividade e acessibilidade', () => {
  test('manifesto e service worker (instalável)', async ({ page, request }) => {
    const manifest = await (await request.get('/manifest.webmanifest')).json();
    expect(manifest.name).toBe('Caminho até Belém');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
    await onboard(page);
    const sw = await page.evaluate(async () => !!(await navigator.serviceWorker.ready).active);
    expect(sw).toBe(true);
  });

  test('funciona offline após o primeiro acesso', async ({ page, context }) => {
    await onboard(page, '2026-12-08');
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload(); // garante que a página é controlada pelo service worker
    await context.setOffline(true);
    await page.goto('/dia/2026-12-08');
    await expect(page.getByRole('heading', { name: 'O sim de Maria' })).toBeVisible();
    await expect(page.getByText('Sem internet')).toBeVisible();
    await page.goto('/novena/9');
    await expect(page.getByRole('heading', { name: '9º encontro: Belém' })).toBeVisible();
    await page.goto('/coroa');
    await expect(page.getByRole('heading', { name: 'Coroa do Advento' })).toBeVisible();
    await context.setOffline(false);
  });

  test('sem rolagem horizontal em 320px nas telas principais', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await onboard(page);
    for (const path of ['/', '/rezar', '/dia/2026-12-13', '/liturgia/2026-12-24', '/agenda', '/agenda/novo', '/mais', '/novena/5', '/coroa', '/presepio', '/canticos', '/circulo', '/backup']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test('letra extra grande em 320px: nada transborda (idosos)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/?hoje=2026-12-13');
    await page.getByRole('button', { name: 'Começar' }).click();
    await page.getByRole('button', { name: 'Extra grande' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    const cont = page.getByRole('button', { name: 'Continuar' });
    if (await cont.isVisible().catch(() => false)) await cont.click();
    await page.getByRole('button', { name: 'Iniciar a jornada' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-font', 'extra');
    for (const path of ['/', '/rezar', '/dia/2026-12-13', '/dia/2026-12-13#noite', '/liturgia/2026-12-25', '/novena', '/novena/5', '/agenda', '/agenda/novo', '/missas', '/mais', '/coroa', '/presepio', '/canticos', '/familia', '/lembretes', '/ajustes', '/backup', '/circulo']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
      const tabsOverflow = await page.evaluate(() => [...document.querySelectorAll('[role=tab]')].filter((e) => e.scrollWidth > e.clientWidth).length);
      expect(tabsOverflow, `${path} (abas)`).toBe(0);
    }
  });

  test('acessibilidade (axe, WCAG 2.2 AA) nas telas principais', async ({ page }) => {
    await onboard(page);
    for (const path of ['/', '/rezar', '/dia/2026-12-13', '/liturgia/2026-12-13', '/novena', '/novena/1', '/agenda', '/agenda/novo', '/missas', '/mais', '/coroa', '/presepio', '/canticos', '/familia', '/lembretes', '/ajustes', '/backup', '/circulo', '/ajuda', '/privacidade']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(graves.map((v) => `${path}: ${v.id} — ${v.nodes[0]?.target}`), path).toEqual([]);
    }
  });

  test('alto contraste também passa no axe', async ({ page }) => {
    await onboard(page);
    await page.goto('/ajustes');
    await page.getByRole('switch', { name: /Alto contraste/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'alto');
    for (const path of ['/', '/dia/2026-12-13', '/agenda/novo']) {
      await page.goto(path);
      const r = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
      expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id), path).toEqual([]);
    }
  });
});
