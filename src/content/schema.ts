/**
 * Modelo de dados do conteúdo editorial (separado da interface).
 * Todo conteúdo é tipado, versionado e validado com Zod nos testes e ao carregar pacotes.
 *
 * Estados editoriais:
 *  - "pendente": texto autoral ou referência ainda não aprovada pela revisão editorial/litúrgica.
 *  - "aprovado": revisado e liberado para publicação comercial.
 */
import { z } from 'zod';

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato AAAA-MM-DD');
export const revisao = z.enum(['pendente', 'aprovado']);
export type Revisao = z.infer<typeof revisao>;

/** Cores litúrgicas usadas no período (Advento/Natal) e nas festas que o interrompem. */
export const corLiturgica = z.enum(['roxo', 'rosa', 'branco', 'vermelho', 'verde']);
export type CorLiturgica = z.infer<typeof corLiturgica>;

/**
 * Uma leitura bíblica. O app diferencia:
 *  - referência bíblica (sempre presente, com seu estado de validação);
 *  - texto integral licenciado (somente quando houver licença registrada em `licenca`);
 *  - link para a fonte oficial (texto integral requer conexão).
 */
export const leitura = z.object({
  tipo: z.enum(['1ª Leitura', 'Salmo Responsorial', '2ª Leitura', 'Aclamação ao Evangelho', 'Evangelho']),
  referencia: z.string().min(2),
  /** Alternativa prevista no Lecionário (ex.: "ou Sf 3,14-18a"). */
  alternativa: z.string().optional(),
  validacao: revisao,
  textoIntegral: z
    .object({ texto: z.string().min(1), licenca: z.string().min(3), fonte: z.string().min(3) })
    .optional(),
});
export type Leitura = z.infer<typeof leitura>;

export const missa = z.object({
  /** Ex.: "Missa da Noite". Vazio quando o dia tem um único formulário. */
  nome: z.string().optional(),
  leituras: z.array(leitura).min(2),
});

export const liturgiaDia = z.object({
  id: isoDate,
  data: isoDate,
  celebracao: z.string().min(3),
  grau: z.enum(['Domingo', 'Solenidade', 'Festa', 'Memória', 'Memória facultativa', 'Dia de semana']),
  cor: corLiturgica,
  /** Observação litúrgica (ex.: memória que a cor admite branco, particularidade do Brasil). */
  observacao: z.string().optional(),
  missas: z.array(missa).min(1),
  reflexao: z.string().min(20),
  proposito: z.string().min(10),
  revisaoReflexao: revisao,
});
export type LiturgiaDia = z.infer<typeof liturgiaDia>;

export const diaAdvento = z.object({
  data: isoDate,
  tema: z.string().min(3),
  liturgiaId: isoDate,
  manha: z.string().min(40),
  noite: z.string().min(40),
  reflexao: z.string().min(40),
  frase: z.string().min(10).max(160),
  gesto: z.string().min(10),
  familia: z.string().min(10),
  revisao: revisao,
});
export type DiaAdvento = z.infer<typeof diaAdvento>;

export const encontroNovena = z.object({
  numero: z.number().int().min(1).max(9),
  dataSugerida: isoDate,
  titulo: z.string(),
  tema: z.string(),
  acolhida: z.string(),
  oracaoInicial: z.string(),
  leitura: z.object({ referencia: z.string(), resumo: z.string(), validacao: revisao }),
  reflexao: z.string(),
  perguntas: z.array(z.string()).min(1),
  preces: z.object({ resposta: z.string(), intencoes: z.array(z.string()).min(3) }),
  gesto: z.string(),
  oracaoFinal: z.string(),
  canticoId: z.string(),
  revisao: revisao,
});
export type EncontroNovena = z.infer<typeof encontroNovena>;

export const cantico = z.object({
  id: z.string(),
  titulo: z.string(),
  ocasioes: z.array(
    z.enum(['advento', 'coroa', 'presepio', 'novena', 'familia', 'vespera', 'natal']),
  ),
  descricao: z.string(),
  fonte: z.string(),
  /** Situação de direitos: só há letra quando é domínio público ou licenciada. */
  direitos: z.enum(['dominio-publico', 'licenciado', 'protegido-sem-licenca']),
  letra: z.string().optional(),
  linkAutorizado: z.string().url().optional(),
  revisao: revisao,
});
export type Cantico = z.infer<typeof cantico>;
export type OcasiaoCantico = Cantico['ocasioes'][number];

/** Pacote de conteúdo de um ano litúrgico (ex.: Advento 2026 → "2026"). */
export const pacoteAno = z.object({
  versao: z.string(),
  anoAdvento: z.number().int(),
  dias: z.array(diaAdvento),
  liturgia: z.array(liturgiaDia),
});
export type PacoteAno = z.infer<typeof pacoteAno>;
