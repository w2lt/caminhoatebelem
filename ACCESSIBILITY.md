# Acessibilidade (meta: WCAG 2.2 AA)

Público inclui pessoas idosas e com pouca familiaridade com tecnologia. Princípios: poucas etapas, botões grandes, texto claro, nada que dependa só de cor ou de gesto complexo.

## Como cada requisito é atendido

| Requisito | Implementação |
|---|---|
| Navegação simples | Barra inferior fixa com 4 áreas (Início, Rezar, Agenda, Mais); conteúdo do dia a 1 toque da tela inicial |
| Alvos de toque | Botões e links com altura mínima de 44–64 px (`min-h-11`…`min-h-16`) |
| Fontes ajustáveis | 3 tamanhos (Normal, Grande, Extra grande) em Ajustes, nas boas-vindas e durante a leitura (A− / A+). Tudo em `rem`, a interface inteira acompanha |
| Contraste | Paleta com variantes escuras para texto (≥ 4,5:1); dourado e rosa claros só decorativos; modo **Alto contraste** |
| Teclado | Ordem natural de foco, foco sempre visível (contorno dourado), link "Pular para o conteúdo", diálogos com foco preso e Esc (Radix) |
| Leitores de tela | `lang="pt-BR"`, títulos hierárquicos, `aria-label` em botões só com ícone, `aria-pressed` em marcadores, `role="switch"` nos interruptores, `role="progressbar"` na novena, `aria-current="date"` no dia de hoje, toasts em `aria-live`, foco movido para o título ao trocar de tela |
| Formulários | Todo campo tem `<label>`; erros em texto (`role="alert"`), `aria-invalid` e `aria-describedby`; foco vai para o primeiro campo com erro |
| Mensagens claras | Erros explicam o que fazer (ex.: "O PDF tem 25 MB. O limite é 20 MB…") |
| Redução de movimento | `prefers-reduced-motion` desliga animações/transições |
| Sem pressão | Sem anúncios, sem rankings, marcações opcionais |
| PDF | Visualização em páginas com rótulo "Página X de Y" e modo **Ver como texto** (texto extraído, ampliável) |
| Cartões de imagem | `alt` descritivo; o texto também pode ser compartilhado como texto |
| Responsividade | Testado sem rolagem horizontal a 320 px |

## Testes automatizados

- `e2e/app.spec.ts`: **axe-core** (tags WCAG 2.0/2.1/2.2 A e AA) em 20 telas, falha em qualquer violação séria ou crítica; também no modo alto contraste.
- Verificação de rolagem horizontal a 320 px em 13 telas.
- Testes de componente verificam `aria-invalid` e mensagens de erro.

Resultado da última execução: ver [TEST_PLAN.md](TEST_PLAN.md).

## O que ainda precisa de teste humano

- [ ] TalkBack (Android) e VoiceOver (iPhone) percorrendo: boas-vindas → oração do dia → marcar → compartilhar; novena; cadastro de Missa.
- [ ] Zoom do sistema em 200% e fonte do sistema grande (Android/iOS).
- [ ] Sessão com 3–5 pessoas idosas: tempo para chegar à oração do dia, cadastro de um evento e compartilhamento pelo WhatsApp.
- [ ] Contraste dos cartões compartilhados (texto creme sobre roxo é > 7:1; rodapé dourado é decorativo).

Ferramentas automáticas detectam só parte dos problemas; a conformidade AA só pode ser afirmada após essa verificação manual.
