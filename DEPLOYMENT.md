# Publicação (GitHub + Cloudflare)

Mesmo modelo do OrçaFácil: código no GitHub (`w2lt`) e publicação na **Cloudflare Workers com arquivos estáticos** (`wrangler.jsonc`). O Worker só roda para `/api/*`; o resto são os arquivos de `dist/`. HTTPS é obrigatório (instalação, offline, compartilhamento).

## 1. Repositório no GitHub

```bash
git init
```

```bash
git add -A
```

```bash
git commit -m "Caminho até Belém: versão inicial"
```

```bash
gh repo create w2lt/caminhoatebelem --private --source . --push
```

`.gitignore` já exclui `node_modules`, `dist`, `.wrangler`, `keys/` (chaves e códigos de ativação) e `.dev.vars`.

## 2. Cloudflare (escolha um)

**A. Conectado ao Git (recomendado)** — Cloudflare → Workers & Pages → Create → Import a repository → `w2lt/caminhoatebelem`.
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Variáveis de build (opcionais): `VITE_SUPPORT_URL`, e as de ativação (ver COMMERCIAL_ACTIVATION.md)

**B. Pelo computador**

```bash
npx wrangler login
```

```bash
npm run deploy
```

Conferir antes, sem publicar:

```bash
npx wrangler deploy --dry-run
```

## 3. Domínio

Zona `caminhoatebelem.com.br` na Cloudflare. Dois ambientes, em Workers separados (`wrangler.jsonc`, `routes` com `custom_domain: true` — o domínio e o certificado são criados no primeiro deploy de cada um):

| Ambiente | Endereço | Worker | Comando |
|---|---|---|---|
| Produção | **https://app.caminhoatebelem.com.br** | `caminhoatebelem` | `npm run deploy` |
| Desenvolvimento | https://app-dev.caminhoatebelem.com.br | `caminhoatebelem-dev` | `npm run deploy:dev` |

- O dev recebe `X-Robots-Tag: noindex, nofollow` (`scripts/mark-dev.mjs`) e tem dados, KV e segredos próprios (`--env dev`).
- Antes do primeiro deploy, não pode haver registro A/CNAME manual para `app` ou `app-dev` no DNS.
- `caminhoatebelem.com.br` e `www` ficam livres (página de vendas ou redirecionamento 301 para `app.` em Rules → Redirect Rules). Nunca sirva o app de produção em dois endereços. **Os dados do usuário ficam ligados ao endereço**: trocar de domínio depois faz o usuário "perder" agenda, intenções e PDFs (teria de restaurar um backup).

## 4. Cabeçalhos e cache

- `public/_headers` vai para `dist/` e é aplicado pela Cloudflare: CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, e `sw.js` sem cache longo.
- `not_found_handling: single-page-application` devolve `index.html` para rotas como `/novena/3`.

## 5. Atualizações

Cada publicação gera um novo service worker. Quem já usa vê **"Nova versão disponível · Atualizar"** e continua na versão atual até tocar. Mudanças no banco seguem as regras de versão em ARCHITECTURE.md. Conteúdo de um novo ano: CONTENT_GUIDE.md.

## 6. Instruções para o cliente

As telas **Boas-vindas** e **Mais → Instalar e ajuda** já trazem o passo a passo para Android (Chrome → ⋮ → Instalar aplicativo) e iPhone (Safari → Compartilhar → Adicionar à Tela de Início). Sugestão: vídeo curto de instalação junto com o acesso.

## 7. Checklist antes de vender

- [ ] Revisão editorial e litúrgica concluída (CONTENT_PENDING_REVIEW.md) e conteúdo marcado como `aprovado`.
- [ ] Domínio próprio com HTTPS, app publicado.
- [ ] Testes em Android e iPhone reais: instalar, rezar offline, importar PDF, compartilhar cartão no WhatsApp, adicionar ICS ao calendário, backup e restauração.
- [ ] Decidir sobre a ativação; se ligada, configurar e testar uma compra ponta a ponta (código real → ativação → uso offline).
- [ ] `VITE_SUPPORT_URL` definido; canal de suporte funcionando.
- [ ] Página de vendas avisando que os dados ficam no celular e da importância do backup.
- [ ] Termos de uso, política de privacidade, reembolso e atualizações anuais.
- [ ] `npm test` e `npm run test:e2e` verdes na versão publicada.

## Situação atual

Build e `wrangler deploy --dry-run` verificados localmente. **Nada foi publicado** e nenhum repositório foi criado no GitHub — isso fica para o responsável, após a revisão.
