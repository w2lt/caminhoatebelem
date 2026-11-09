/**
 * Registro de pacotes de conteúdo por ano do Advento.
 * Para um novo ano: crie src/content/<ano>/ (dias.ts e liturgia.ts) e registre aqui.
 * Pacotes validados por terceiros podem ser adicionados no mesmo formato (schema.ts).
 */
import { pacoteAno, type DiaAdvento, type LiturgiaDia, type PacoteAno } from './schema';
import { dias2026 } from './2026/dias';
import { liturgia2026 } from './2026/liturgia';

export const PACOTES: Record<number, PacoteAno> = {
  2026: { versao: '2026.1.0', anoAdvento: 2026, dias: dias2026, liturgia: liturgia2026 },
};

/** Valida um pacote (usado nos testes e ao registrar pacotes externos). */
export function validarPacote(p: unknown): PacoteAno {
  return pacoteAno.parse(p);
}

export function pacoteDoAno(ano: number): PacoteAno | undefined {
  return PACOTES[ano];
}

export function anosDisponiveis(): number[] {
  return Object.keys(PACOTES).map(Number).sort();
}

export function diaPorData(data: string): DiaAdvento | undefined {
  return PACOTES[Number(data.slice(0, 4))]?.dias.find((d) => d.data === data);
}

export function liturgiaPorData(data: string): LiturgiaDia | undefined {
  return PACOTES[Number(data.slice(0, 4))]?.liturgia.find((l) => l.data === data);
}

/** Links para fontes oficiais/autorizadas (texto integral requer conexão). */
export function fontesOficiais(data: string): { nome: string; url: string }[] {
  const [y, m, d] = data.split('-');
  return [
    { nome: 'Vatican News — Evangelho do dia', url: `https://www.vaticannews.va/pt/evangelho-do-dia/${y}/${m}/${d}.html` },
    { nome: 'CNBB — Liturgia diária', url: 'https://www.cnbb.org.br/liturgia-diaria/' },
    { nome: 'Canção Nova — Liturgia diária', url: 'https://liturgia.cancaonova.com/pb/' },
  ];
}
