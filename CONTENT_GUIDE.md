# Guia de conteúdo

Todo o conteúdo religioso fica em `src/content/`, separado das telas. Os formatos estão em `src/content/schema.ts` e são validados automaticamente pelos testes (`npm test`).

## Onde está cada coisa

| Conteúdo | Arquivo |
|---|---|
| Jornada diária (tema, oração da manhã/noite, reflexão, frase, gesto, proposta para a família) | `src/content/2026/dias.ts` |
| Liturgia diária (celebração, grau, cor, leituras por Missa, reflexão, propósito) | `src/content/2026/liturgia.ts` |
| Novena de Natal (9 encontros) | `src/content/novena.ts` |
| Cânticos | `src/content/canticos.ts` |
| Presépio, coroa, cores litúrgicas, orações tradicionais | `src/content/tradicoes.ts` |
| Registro dos anos e links oficiais | `src/content/index.ts` |

## Regras editoriais (obrigatórias)

1. **Não inventar leituras nem referências.** Toda referência bíblica deve ser conferida no Lecionário/Diretório Litúrgico da CNBB do ano.
2. **Não reproduzir texto integral protegido** (tradução litúrgica oficial, letras de cânticos, gravações) sem licença. Sem licença: referência + link para fonte autorizada.
3. **Não atribuir frases** a santos, papas ou à Bíblia sem fonte verificada. As frases do dia são autorais e não levam atribuição.
4. **Distinguir conteúdo oficial de autoral.** O app mostra "Texto autoral do Caminho até Belém · em revisão editorial" enquanto `revisao: 'pendente'`.
5. **Tradições não são normas.** Data de montagem do presépio e cores das velas da coroa são apresentadas como tradições; cores litúrgicas seguem as normas.
6. Linguagem clara, acolhedora, frases curtas (pensando em idosos e leitores de tela).

## Estados de revisão

| Campo | Onde | Valores |
|---|---|---|
| `revisao` | dia, encontro da novena, cântico | `pendente` → `aprovado` |
| `revisaoReflexao` | liturgia (reflexão/propósito) | `pendente` → `aprovado` |
| `validacao` | cada leitura e a leitura da novena | `pendente` → `aprovado` |

Ao aprovar, troque o valor no arquivo e publique uma nova versão. O aviso de revisão some sozinho.

## Texto integral licenciado (quando houver licença)

Cada leitura aceita `textoIntegral: { texto, licenca, fonte }`. O teste `content.test.ts` hoje exige que **nenhuma** leitura tenha texto integral; ao obter licença, ajuste esse teste e registre a licença em `licenca` (ex.: "Licença CNBB nº … de …/…/2026").

## Cânticos

`direitos`: `dominio-publico` (pode ter `letra`), `licenciado` (pode ter `letra`, citar licença em `fonte`), `protegido-sem-licenca` (**sem** `letra`). `linkAutorizado` só para páginas oficiais dos detentores. O teste impede letra em obra protegida.

## Preparar um novo ano (ex.: Advento 2027)

1. O calendário já é calculado para qualquer ano (ex.: 2027 → 1º Domingo 28/11/2027, Ano C; ver `src/domain/liturgical.test.ts`).
2. Crie `src/content/2027/dias.ts` e `src/content/2027/liturgia.ts` copiando a estrutura de 2026 (um registro para **cada** data do 1º Domingo ao Natal).
3. Registre em `src/content/index.ts`: `2027: { versao: '2027.1.0', anoAdvento: 2027, dias: dias2027, liturgia: liturgia2027 }`.
4. Ajuste `novena.ts` (as datas sugeridas usam o ano) e o teste de conteúdo para o novo ano.
5. Rode `npm test` (o teste garante 1 registro por dia, sem repetições, esquema válido).
6. Conferência editorial e litúrgica → marque `aprovado` → publique.

Datas sem pacote mostram uma mensagem clara e os links das fontes oficiais.

## Pacotes validados por terceiros

Um pacote externo (JSON) pode ser validado com `validarPacote()` (`src/content/index.ts`) antes de ser incluído no build.
