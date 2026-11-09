# Plano de testes

## Como rodar

```bash
npm test
```

```bash
npm run test:e2e
```

O E2E faz o build de produção, sobe `vite preview` na porta 4173 e usa o **Google Chrome instalado** (`channel: 'chrome'`) emulando um Pixel 5 em pt-BR / America/Sao_Paulo. Se já houver um servidor na 4173, ele é reutilizado — rode `npm run build` antes para testar o código atual.

## Última execução — redesign v2.1 (09/11/2026, Windows 10, Node 26, Chrome)

| Suíte | Resultado |
|---|---|
| Vitest (unitários + componentes) | **59/59 aprovados** |
| Playwright (E2E no build de produção) | **17/17 aprovados** na mesma rodada (novo: "letra extra grande em 320px: nada transborda") |
| axe WCAG 2.2 AA | 0 violações sérias/críticas em 20 telas + alto contraste |
| `tsc --noEmit` / `vite build` | sem erros · pré-cache de 76 arquivos (~2,8 MB, inclui fontes e ilustrações) |

Testes ajustados ao novo visual (sem mudar o que é verificado): espera pela navegação "Atalhos do dia" no lugar do título "Meu Advento"; contagem lida no novo cabeçalho; frase do dia acessada pela aba "Frase"; novo teste de abas (seleção, `#noite` no endereço, navegação por setas).

## Execução anterior (08/11/2026, Windows 10, Node 26, Chrome)

| Suíte | Resultado |
|---|---|
| Vitest (unitários + componentes) | **59/59 aprovados** (6 arquivos) |
| Playwright (E2E no build de produção) | **16/16 aprovados** (o teste do Círculo foi reexecutado isoladamente após corrigir o seletor; os outros 15 passaram na rodada completa) |
| `tsc --noEmit` | sem erros |
| `vite build` | ok (pré-cache de 62 arquivos, ~2,5 MB) |
| `wrangler deploy --dry-run` | ok (Worker compila; binding ASSETS) |

## Cobertura por requisito

| Requisito (prompt §26) | Onde |
|---|---|
| Cálculo do Advento (vários anos, Natal no domingo, ciclo A/B/C, Imaculada transferida) | `src/domain/liturgical.test.ts` |
| Identificação da data litúrgica (antes, Advento, Gaudete, férias maiores, Natal, depois) | `src/domain/liturgical.test.ts` |
| Carregamento do conteúdo diário (27 dias, 1 por data, liturgia correspondente, sem repetição, sem atribuições, sem texto integral sem licença) | `src/content/content.test.ts`, `src/features/features.test.tsx` |
| Persistência (preferências validadas, marcações, intenções, migração v1→v2) | `src/db/db.test.ts`, E2E "oração do dia" |
| CRUD da agenda (validação, ordenação, próximo, passados, exclusão com confirmação) | `src/db/db.test.ts`, `features.test.tsx`, E2E "agenda" |
| Cadastro de novenas (Círculo com 9 encontros; troca de modalidade sem perder dados) | `src/db/db.test.ts`, E2E "novena" e "Círculo" |
| Importação de PDFs (tipo, vazio, > 20 MB, conteúdo falso, nome malicioso; PDF válido aberto offline, modo texto) | `src/services/services.test.ts`, E2E "Círculo" |
| Backup e restauração (ida e volta com PDF, licença fora do backup, arquivo inválido/alterado/versão futura sem tocar nos dados) | `services.test.ts`, E2E "backup" |
| Compartilhamento (Web Share, fallback copiar, cancelamento, WhatsApp, cartões 3 formatos, ajuste de texto sem corte) | `services.test.ts`, E2E "compartilhar" |
| ICS (escape, dobra de linha, dia inteiro, alarme, virada de meia-noite, repetição diária) | `services.test.ts`, E2E "Missas" e "lembretes" |
| Lembretes (planejamento conforme preferências) | `services.test.ts`, E2E "lembretes" |
| Ativação comercial (Worker: 503 sem configuração, token assinado por aparelho, código inválido/revogado/limite, rate limit, roteamento; app: fluxo completo, erros, token forjado) | `worker/activation.test.ts` |
| Funcionamento offline | E2E "funciona offline" e "Círculo" (PDF offline) |
| Acessibilidade | E2E axe em 20 telas + alto contraste |
| Instalação PWA (manifesto, ícone maskable, service worker ativo) | E2E "manifesto e service worker" |
| Responsividade (sem rolagem horizontal a 320 px em 13 telas) | E2E "sem rolagem horizontal" |

## Testes manuais pendentes (não executados)

Não foram feitos e **não devem ser considerados aprovados**:

- [ ] Instalação real: Android (Chrome) e iPhone (Safari → Adicionar à Tela de Início), abrir pelo ícone, splash.
- [ ] Offline em aparelho real (modo avião) após a 1ª abertura.
- [ ] Compartilhar cartão como imagem pelo menu nativo (WhatsApp, Instagram) no Android e no iPhone.
- [ ] Importar `.ics` no Google Agenda e no Calendário do iPhone; conferir alarmes e repetição diária.
- [ ] Importar PDF real de novena de uma comunidade (escaneado e com texto), inclusive > 10 MB.
- [ ] Backup → enviar para si pelo WhatsApp → restaurar em outro aparelho.
- [ ] TalkBack/VoiceOver, zoom 200%, sessão com usuários idosos (ver ACCESSIBILITY.md).
- [ ] Desempenho em celular intermediário (abertura a frio, 3G).
- [ ] Ativação ponta a ponta na Cloudflare real (KV + segredo) — só depois da configuração comercial.
