# Caminho até Belém

> Uma jornada de fé, oração e esperança para celebrar o verdadeiro Natal.

PWA católica (mobile-first, offline-first e local-first) para o Advento e o Natal: orações diárias, liturgia, reflexões, Novena de Natal, novena dos Círculos Bíblicos, agenda comunitária, Missas de Natal, presépio, coroa do Advento, cânticos, atividades em família e compartilhamento de cartões.

Versão 2.1 · Advento 2026 (29/11 a 25/12/2026, Ano B) · identidade visual "vigília luminosa" (ver [ARCHITECTURE.md](ARCHITECTURE.md#design-system--vigília-luminosa)).

## Começar

```bash
npm install
```

```bash
npm run dev
```

Abra `http://localhost:5173`. Para ver o conteúdo de outro dia, use `?hoje=AAAA-MM-DD` (ex.: `/?hoje=2026-12-13`).

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Typecheck + build de produção (`dist/`, com service worker) |
| `npm run preview` | Serve o build de produção em `http://localhost:4173` |
| `npm test` | Testes unitários e de componentes (Vitest + Testing Library) |
| `npm run test:e2e` | Testes ponta a ponta no build (Playwright, Chrome instalado, emulando Android) |
| `npm run icons` | Regenera os ícones PNG a partir do desenho de `public/icon.svg` |
| `node scripts/optimize-illustrations.mjs <pasta>` | Converte as ilustrações exportadas do Canva (PNG) em WebP para `public/ilustracoes/` |
| `node scripts/capture-screens.mjs [url] [pasta]` | Captura as telas do app (celular) — usado na apresentação |
| `node scripts/build-presentation.mjs` | Gera o PDF da apresentação para a paróquia |
| `npm run keys:generate -- keys` | Gera o par de chaves da ativação comercial (ver COMMERCIAL_ACTIVATION.md) |
| `npm run deploy` | Build + publicação na Cloudflare (`wrangler deploy`) |

## Situação do MVP

| Área | Situação |
|---|---|
| Fundação (React/TS/Vite/Tailwind, Dexie, PWA, navegação, design system) | ✅ Implementado e testado |
| Redesign premium v2.1 (fontes incorporadas, ilustrações do Canva, abas na página do dia, cartões novos) | ✅ Implementado e testado · ponto de restauração: tag `pre-redesign-v2` |
| Calendário litúrgico automático (qualquer ano) | ✅ Implementado e testado |
| Orações, reflexões, frases, gestos (27 dias) | ✅ Implementado · ⚠️ conteúdo autoral **pendente de revisão editorial** |
| Liturgia diária (referências + links oficiais) | ✅ Implementado · ⚠️ referências **pendentes de conferência** com o Diretório Litúrgico CNBB 2026; sem texto integral (sem licença) |
| Novena de Natal (9 encontros) | ✅ Implementado · ⚠️ conteúdo autoral pendente de revisão |
| Novena dos Círculos Bíblicos + PDF offline | ✅ Implementado e testado |
| Agenda, Missas de Natal, ICS | ✅ Implementado e testado |
| Lembretes | ✅ ICS (confiável) + avisos com app aberto · ℹ️ sem push com app fechado (limitação de PWA, documentada) |
| Presépio, coroa, cânticos, família | ✅ Implementado · ⚠️ textos pendentes de revisão; letras só em domínio público |
| Compartilhamento (texto, WhatsApp, cartões 9:16, 4:5, 1:1) | ✅ Implementado e testado |
| Backup/restauração com validação | ✅ Implementado e testado |
| Ativação comercial | ✅ Interface, contrato de API e Worker implementados e testados · ⏳ **desligada** até a infraestrutura (KV, chaves, códigos) ser configurada |
| Publicação (GitHub + Cloudflare) | ⏳ Pronto para publicar; não publicado |

As pendências completas estão em [CONTENT_PENDING_REVIEW.md](CONTENT_PENDING_REVIEW.md) e no fim de [DEPLOYMENT.md](DEPLOYMENT.md).

## Documentação

- [ARCHITECTURE.md](ARCHITECTURE.md) — estrutura, camadas, banco local e decisões técnicas
- [CONTENT_GUIDE.md](CONTENT_GUIDE.md) — como editar e publicar conteúdo (e um novo ano)
- [CONTENT_PENDING_REVIEW.md](CONTENT_PENDING_REVIEW.md) — tudo o que precisa de revisão editorial/litúrgica
- [ACCESSIBILITY.md](ACCESSIBILITY.md) — requisitos WCAG 2.2 AA e como são atendidos
- [COMMERCIAL_ACTIVATION.md](COMMERCIAL_ACTIVATION.md) — ativação por código (Kiwify/Hotmart)
- [DEPLOYMENT.md](DEPLOYMENT.md) — GitHub + Cloudflare, domínio, checklist de publicação
- [TEST_PLAN.md](TEST_PLAN.md) — o que é testado, como rodar e testes manuais pendentes

## Privacidade

Sem cadastro, sem anúncios, sem rastreadores. Agenda, intenções, marcações, PDFs e preferências ficam no IndexedDB do aparelho. Nada disso é enviado a servidores. A única comunicação de rede do app (fora os links externos que o usuário toca) é a ativação comercial opcional, que envia apenas o código e um identificador aleatório do aparelho.
