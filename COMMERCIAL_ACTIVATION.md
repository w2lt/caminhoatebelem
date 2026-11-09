# Ativação comercial

O app é vendido em plataformas de infoprodutos (Kiwify, Hotmart). **A PWA não processa pagamentos.** A ativação é opcional e está **desligada por padrão**.

## Opções

| Opção | Como funciona | Situação |
|---|---|---|
| A. Link entregue ao comprador | Link do app na área de membros/e-mail da compra | Funciona hoje (ativação desligada) |
| B. Código de ativação | O comprador digita um código; o servidor valida e devolve um token assinado | **Implementado** (app + Worker + testes); falta configurar infraestrutura |
| C. Integração automática com a plataforma | Webhook da Kiwify/Hotmart cria/revoga códigos | **Não implementado** — depende de credenciais e do formato oficial do webhook |

## Como a opção B funciona

1. Você gera códigos (`XXXX-XXXX-XXXX`) no seu computador. O KV da Cloudflare guarda só o **SHA-256** de cada código.
2. Entrega um código por compra (e-mail da plataforma, área de membros, ou manualmente).
3. No 1º uso, o app envia `POST /api/activate` com `{ code, deviceId }` (`deviceId` é aleatório; nenhum dado pessoal).
4. O Worker confere o hash no KV, o status (`active`/`revoked`) e o limite de aparelhos, e devolve um **token assinado** com a chave privada ECDSA P-256 (segredo do Worker).
5. O app verifica a assinatura com a **chave pública** (no build) e guarda o token na tabela `license` (fora do backup).
6. Depois disso, a verificação é local: funciona **offline**.

### Contrato da API

`POST /api/activate` — corpo JSON `{ "code": "ABCD2345EFGH", "deviceId": "<uuid v4>" }`

| Status | Corpo | Significado |
|---|---|---|
| 200 | `{ "token": "<payload>.<assinatura>" }` | Ativado. Payload: `{ v: 1, lic: <16 hex do hash>, dev: <deviceId>, iat, exp? }` |
| 400 | `{ "error": "bad_request" }` | Código fora do formato / deviceId inválido |
| 403 | `{ "error": "revoked" }` | Código revogado (ex.: reembolso) |
| 404 | `{ "error": "invalid_code" }` | Código inexistente |
| 409 | `{ "error": "device_limit" }` | Limite de aparelhos atingido |
| 429 | `{ "error": "rate_limited" }` | Mais de 10 tentativas em 10 min pelo mesmo IP |
| 503 | `{ "error": "not_configured" }` | KV ou segredo ausentes (nunca "ativa de mentira") |

Registro no KV: chave `code:<sha256 do código sem hífens, maiúsculo>` → `{"status":"active","maxDevices":3,"devices":[]}`.

## Configurar (passo a passo)

1. Gerar o par de chaves (fica em `keys/`, ignorada pelo git):
   ```bash
   npm run keys:generate -- keys
   ```
2. Criar o KV e anotar o `id`:
   ```bash
   npx wrangler kv namespace create LICENSES
   ```
   Descomentar o bloco `kv_namespaces` em `wrangler.jsonc` com esse `id`.
3. Guardar a chave privada como segredo do Worker (cole o conteúdo de `keys/private.jwk.json`):
   ```bash
   npx wrangler secret put ACTIVATION_PRIVATE_JWK
   ```
4. Variáveis de build (no painel da Cloudflare → Build → Variables, ou `.env.production.local`):
   ```
   VITE_ACTIVATION_MODE=required
   VITE_ACTIVATION_PUBLIC_JWK={"kty":"EC","crv":"P-256","x":"…","y":"…"}
   VITE_SUPPORT_URL=https://wa.me/55XXXXXXXXXXX
   ```
5. Gerar códigos (ex.: 200 códigos, até 3 aparelhos cada) e enviar ao KV:
   ```bash
   npm run keys:generate -- codes 200 3
   ```
   ```bash
   npx wrangler kv bulk put --binding LICENSES keys/kv-bulk-AAAA-MM-DD.json --remote
   ```
6. Revogar um código (reembolso): editar o valor no KV para `"status":"revoked"`. O aparelho já ativado continua funcionando offline até o token expirar — para forçar expiração, defina `ACTIVATION_TOKEN_DAYS` (ex.: `365`) como variável do Worker.

## Limites (dito com honestidade)

- Inibe o compartilhamento casual do link, mas **não é proteção absoluta** contra cópia: quem tem conhecimento técnico pode alterar o código do app no próprio aparelho.
- Não há senha universal nem segredo no frontend.
- Trocar o par de chaves invalida todas as ativações existentes.
- Limpar os dados do navegador apaga o token: o usuário precisa ativar de novo (conta como o mesmo aparelho só se o `deviceId` for restaurado — não é, pois a licença fica fora do backup; considere `maxDevices` ≥ 3).

## Suporte ao cliente (sugestão)

- E-mail de entrega com: link do app, código, vídeo de instalação (Android e iPhone), contato de suporte.
- Erros comuns: código digitado errado (o app aceita com ou sem hífens/espaços), sem internet na ativação, limite de aparelhos.
