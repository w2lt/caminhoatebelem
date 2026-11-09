# Arquitetura

## Visão geral

PWA estática (React 19 + TypeScript + Vite 6 + Tailwind 4) servida pela Cloudflare (Workers com arquivos estáticos). Todo o conteúdo editorial vem no próprio build e é pré-cacheado pelo service worker; os dados pessoais ficam no IndexedDB (Dexie). Um Worker mínimo atende só `/api/activate` (ativação comercial opcional).

```
Navegador (celular)
├── Service worker (Workbox, pré-cache de todo o app)  → funciona offline após o 1º acesso
├── React (telas)  ──► Regras de negócio (db/*, services/*, domain/*)
│                        ├── Calendário litúrgico (domain/liturgical.ts)   — puro, sem conteúdo
│                        ├── Conteúdo editorial (content/**)               — dados tipados e versionados
│                        └── IndexedDB / Dexie (db/database.ts)            — dados pessoais
└── fetch /api/activate (só se a ativação estiver ligada)
                                   │
Cloudflare Worker (worker/index.ts) ─► KV LICENSES (hash dos códigos) + segredo ACTIVATION_PRIVATE_JWK
```

## Camadas e pastas

| Camada | Pasta | Responsabilidade |
|---|---|---|
| 1. Interface | `src/features/**` | Telas por área (home, rezar, liturgia, novena, círculo, agenda, tradições, mais) |
| 2. Componentes reutilizáveis | `src/ui/` | `kit.tsx` (botões, campos, cartões), `reading.tsx` (leitura, A−/A+, marcar, compartilhar), `dialogs.tsx` (Radix Dialog: confirmação e compartilhamento), `feedback.tsx` (toasts com `aria-live`) |
| 3. Regras de negócio | `src/db/events.ts`, `circle.ts`, `progress.ts`, `settings.ts` | Validação (Zod), CRUD, ordenação, próximo evento |
| 4. Calendário litúrgico | `src/domain/liturgical.ts`, `dates.ts` | Domingos do Advento, ciclo A/B/C, Gaudete, férias maiores, Imaculada transferida (Brasil), novena |
| 5. Conteúdo editorial | `src/content/` | `schema.ts` (Zod), `2026/dias.ts`, `2026/liturgia.ts`, `novena.ts`, `canticos.ts`, `tradicoes.ts`, `index.ts` (registro de pacotes por ano) |
| 6. Persistência local | `src/db/database.ts` | Dexie, versões/migrações, erros amigáveis, armazenamento persistente |
| 7. Compartilhamento | `src/services/share.ts`, `cards.ts` | Web Share API, copiar, WhatsApp, cartões em canvas (1080×1920/1350/1080) |
| 8. Importação/exportação | `src/services/pdf.ts`, `backup.ts`, `ics.ts` | PDF (validação + pdf.js), backup JSON com checksum, iCalendar |
| 9. Configurações | `src/db/settings.ts`, `features/mais/AjustesPage.tsx` | Fonte (3 tamanhos), alto contraste, modalidade da novena, lembretes |
| 10. Acesso comercial | `src/services/activation.ts`, `worker/index.ts` | Ativação por código com token assinado (ECDSA P-256) |

O conteúdo religioso nunca fica dentro de componentes: as telas leem `content/` por funções (`diaPorData`, `liturgiaPorData`, `pacoteDoAno`).

## Calendário

- 4º Domingo = último domingo antes de 25/12 (se o Natal cai no domingo, 18/12); 1º Domingo = 4º − 21 dias.
- Ciclo dominical: ano litúrgico que termina em N+1 → `(N+1) % 3`: 1=A, 2=B, 0=C. Advento 2026 → **Ano B**.
- As **leituras não são deduzidas** do calendário: vêm da base editorial do ano (festas como Santo André, Imaculada e Guadalupe alteram a sequência).
- Para testar outro dia: `?hoje=AAAA-MM-DD` (guardado na sessão da aba).

## Banco local (Dexie)

Tabelas: `settings`, `events`, `progress`, `intentions`, `circle`, `pdfs`, `songs`, `license`.

| Versão | Mudança |
|---|---|
| 1 | Esquema inicial |
| 2 | Índices `[category+date]` e `status` em `events`; tabela `license`; migração preenche `status`/`address` em eventos antigos |

Regra: **nunca altere uma versão publicada**; crie a próxima com `.upgrade()` e um teste em `db.test.ts`.

- `license` fica fora do backup (camada comercial separada dos dados pessoais).
- PDFs são guardados como `Blob` (limite 20 MB por arquivo; checagem de espaço com `navigator.storage.estimate()`).
- `navigator.storage.persist()` é pedido no início e pode ser pedido de novo em Backup.
- Erros `QuotaExceededError` e de banco indisponível viram mensagens claras (`friendlyDbError`).

## Offline e atualização

- `vite-plugin-pwa` (generateSW): pré-cache de `js, mjs, css, html, svg, png, webmanifest` (inclui o worker do pdf.js).
- `navigateFallback: /index.html`; `/api/*` nunca vem do cache.
- `registerType: 'prompt'`: a nova versão só entra quando o usuário toca em **Atualizar** (nunca no meio de uma oração).
- Telas secundárias são carregadas sob demanda (React.lazy), mas também ficam no pré-cache.

## Segurança

- CSP e cabeçalhos em `public/_headers` (aplicados pela Cloudflare): `script-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, etc.
- Nada de `dangerouslySetInnerHTML`; todo texto é renderizado pelo React (escapado).
- Entradas validadas com Zod, sem caracteres de controle, com limites de tamanho.
- PDF: tipo, tamanho, assinatura `%PDF-`, abertura de teste com pdf.js (`isEvalSupported: false`, `enableXfa: false`); exibição em `<canvas>` (sem iframe, sem scripts/links ativos); nome do arquivo sanitizado.
- Backup: formato, versão, checksum SHA-256 e esquema de cada registro validados antes de gravar; restauração em transação única (tudo ou nada).
- Ativação: só a chave **pública** vai no frontend; segredo no Worker; códigos guardados como hash; limite de tentativas por IP.

## Dependências (justificativa)

`react`, `react-router-dom` (rotas), `dexie` + `dexie-react-hooks` (IndexedDB reativo), `zod` (validação), `date-fns` (datas pt-BR), `lucide-react` (ícones), `@radix-ui/react-dialog` (diálogos acessíveis), `pdfjs-dist` (leitura de PDF em canvas — necessário porque o Chrome Android não exibe PDF embutido). Dev: Vite, Tailwind, vite-plugin-pwa, Vitest, Testing Library, fake-indexeddb, jsdom, Playwright, @axe-core/playwright, wrangler.
