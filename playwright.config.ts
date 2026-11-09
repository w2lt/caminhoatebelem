import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta no build de produção (com service worker),
 * emulando um celular Android (Pixel 5). Usa o Google Chrome instalado
 * no computador (channel: 'chrome'), sem baixar navegadores.
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: [['list']],
  use: {
    ...devices['Pixel 5'],
    channel: 'chrome',
    baseURL: 'http://localhost:4173',
    serviceWorkers: 'allow',
    acceptDownloads: true,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
