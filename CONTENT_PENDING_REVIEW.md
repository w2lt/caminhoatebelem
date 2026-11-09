# Pendências de revisão (editorial, litúrgica, técnica e comercial)

**Nenhum conteúdo religioso deste app foi revisado por autoridade editorial/litúrgica.** Tudo abaixo precisa de aprovação antes da venda.

## 1. Liturgia diária — `src/content/2026/liturgia.ts`

As referências foram cadastradas a partir do Lecionário Romano (Ano B, dias de semana do Advento, solenidades e festas) e estão com `validacao: 'pendente'`.

Conferir **cada data** com o **Diretório Litúrgico da CNBB 2026** e o Lecionário:

| Data | Ponto de atenção |
|---|---|
| 30/11 | Festa de Santo André (substitui a segunda-feira da 1ª semana). Cor vermelha. |
| 03/12, 07/12, 14/12 | Memórias (S. Francisco Xavier, S. Ambrósio, S. João da Cruz): cor roxa ou branca; leituras do dia de semana. |
| 08/12 | Imaculada Conceição: solenidade (terça-feira em 2026). |
| **12/12** | **Nossa Senhora de Guadalupe — Festa no Brasil.** Leituras próprias marcadas como **a conferir** (Zc 2,14-17 ou Ap 11,19a;12,1-6a.10ab; cântico de Jt 13; Lc 1,39-47). Confirmar se o Diretório 2026 prevê exatamente estas. |
| 13/12 | Gaudete: rosa permitido. Salmo = Cântico de Lc 1. |
| 21/12 | Primeira leitura com alternativa (Ct 2,8-14 ou Sf 3,14-18a). |
| 22/12 | Salmo = Cântico de 1Sm 2. |
| 24/12 | Duas Missas (manhã, roxo; Vigília do Natal, branco). |
| 25/12 | Três formulários (Noite, Aurora, Dia). |
| Todas | Versículos exatos dos salmos (o app mostra só o número do salmo, sem versículos, para não errar); **aclamação ao Evangelho não cadastrada** (o app remete à fonte). |

Também conferir:
- Links das fontes em `src/content/index.ts` (`fontesOficiais`): Vatican News (por data), CNBB e Canção Nova (páginas gerais). Confirmar URLs e, se possível, obter links por data.
- **Licença de texto integral**: não há. Se a CNBB/editora autorizar, preencher `textoIntegral`.

## 2. Conteúdo autoral (todo com `revisao: 'pendente'`)

| Conteúdo | Arquivo | Volume |
|---|---|---|
| 27 dias: tema, oração da manhã, oração da noite, reflexão, frase, gesto, família | `src/content/2026/dias.ts` | 189 textos |
| Reflexões e propósitos da liturgia | `src/content/2026/liturgia.ts` | 54 textos |
| Novena de Natal: 9 encontros (acolhida, orações, resumo da leitura, reflexão, perguntas, preces, gesto) | `src/content/novena.ts` | 9 encontros |
| Presépio (introdução, personagens, tutorial, 2 orações) e coroa (6 seções, cores, 4 orações) | `src/content/tradicoes.ts` | — |
| Oração antes da ceia de Natal | `src/content/tradicoes.ts` | 1 |

Pontos específicos para o revisor:
- Afirmações históricas: presépio de Greccio (1223, São Francisco); coroa do Advento "difundida a partir do século XIX".
- Resumos das leituras da novena (Is 7,10-14; Is 11,1-5; Mt 1,18-24; Lc 1,5-25; Lc 1,26-38; Lc 1,39-45; Lc 1,46-55; Lc 1,57-66; Lc 2,1-7): conferir fidelidade.
- Fórmulas tradicionais (Pai-Nosso, Ave-Maria, Glória): conferir a forma usada no Brasil.

## 3. Cânticos — `src/content/canticos.ts`

- Letras incluídas apenas de textos latinos tradicionais (Rorate Caeli, Veni Emmanuel, Alma Redemptoris Mater, início do Magnificat, Adeste Fideles, Gloria in excelsis). Confirmar domínio público.
- "Noite Feliz": original em domínio público, mas a **versão em português** não teve a situação confirmada — sem letra.
- Dois registros são marcadores para "canto da comunidade" — substituir por cânticos com licença, se houver.
- `linkAutorizado`: nenhum cadastrado. Incluir apenas links oficiais de detentores.

## 3b. Ilustrações (Canva)

- `public/ilustracoes/ceu.webp`, `coroa.webp`, `presepio.webp`: geradas por IA no Canva (conta do responsável) e exportadas da prancheta "Prancheta creme para ilustrações". Conferir na conta se o uso comercial segue os Termos do Canva para conteúdo gerado por IA e guardar o registro.
- Revisão iconográfica do presépio (Maria, José e o Menino) por quem fará a revisão editorial.

## 4. Pendências técnicas

- [ ] Testar em **aparelhos reais**: Android intermediário (Chrome) e iPhone (Safari, instalado na tela inicial) — instalação, offline, PDF, compartilhamento de imagem, ICS no calendário nativo.
- [ ] Teste com leitor de tela real (TalkBack e VoiceOver) e com 3–5 pessoas idosas.
- [ ] Notificações com o app fechado não existem (limitação de PWA sem push). Se for necessário, avaliar Web Push com servidor (custo e LGPD) — fora do MVP.
- [ ] Bundle principal ~170 KB gzip; medir carregamento num celular intermediário em 3G.

## 5. Pendências comerciais

- [ ] Decidir se a ativação será exigida (`VITE_ACTIVATION_MODE=required`). Hoje está **desligada**.
- [ ] Se sim: criar KV, gerar chaves e códigos, configurar segredo, definir limite de aparelhos (ver COMMERCIAL_ACTIVATION.md).
- [ ] Integração automática com Kiwify/Hotmart (webhook de compra/reembolso) **não implementada** — depende de credenciais e do formato oficial do webhook.
- [ ] Contato de suporte: definir `VITE_SUPPORT_URL`.
- [ ] Termos de uso, política de privacidade (texto jurídico), política de reembolso e de atualizações anuais.
- [ ] Domínio próprio definitivo (mudar de domínio depois faz o usuário "perder" os dados locais).
