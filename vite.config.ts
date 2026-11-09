/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Atualização com aviso ("Nova versão disponível") — nunca recarrega sozinho no meio da oração.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Caminho até Belém',
        short_name: 'Até Belém',
        description: 'Uma jornada de fé, oração e esperança para celebrar o verdadeiro Natal.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F8F3E9',
        theme_color: '#60377D',
        categories: ['lifestyle', 'books', 'education'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Pré-cache de TODO o app (inclui o leitor de PDF pdf.js, cujo worker é .mjs):
        // orações, liturgia, novena e conteúdos catequéticos funcionam offline após o 1º acesso.
        globPatterns: ['**/*.{js,mjs,css,html,svg,png,webp,ico,webmanifest,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/index.html',
        // A API de ativação nunca é servida do cache.
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
  build: { chunkSizeWarningLimit: 1500 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'worker/**/*.test.ts'],
    css: false,
  },
});
