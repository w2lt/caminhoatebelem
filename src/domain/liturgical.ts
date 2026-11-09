/**
 * Calendário litúrgico do Advento e do Natal — módulo independente, sem dependência de conteúdo.
 *
 * Regras:
 *  - O 4º Domingo do Advento é o último domingo antes de 25/12 (se o Natal cai num domingo, é 18/12).
 *  - O 1º Domingo é 21 dias antes do 4º (entre 27/11 e 03/12).
 *  - Ciclo dominical: o ano litúrgico que começa no Advento de N termina em N+1;
 *    (N+1) % 3 → 1 = Ano A, 2 = Ano B, 0 = Ano C.
 *  - Particularidade do Brasil: a Imaculada Conceição (08/12), se cair num domingo do Advento,
 *    é transferida para segunda-feira (09/12).
 *
 * As LEITURAS não são deduzidas daqui: vêm da base editorial de cada ano (src/content/<ano>),
 * porque festas e solenidades alteram a sequência ordinária.
 */
import { addDaysIso, diffDays, fromIso, type IsoDate } from './dates';

export type Season = 'antes-do-advento' | 'advento' | 'natal' | 'tempo-do-natal';
export type Ciclo = 'A' | 'B' | 'C';

export interface AdventCalendar {
  anoAdvento: number;
  domingos: [IsoDate, IsoDate, IsoDate, IsoDate];
  natal: IsoDate;
  ciclo: Ciclo;
  imaculada: IsoDate;
  /** Início das férias maiores do Advento (17/12): leituras próprias por data. */
  feriasMaiores: IsoDate;
  totalDias: number;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function adventCalendar(year: number): AdventCalendar {
  const natal = `${year}-12-25`;
  const dow = fromIso(natal).getDay(); // 0 = domingo
  const quarto = addDaysIso(natal, -(dow === 0 ? 7 : dow));
  const primeiro = addDaysIso(quarto, -21);
  const domingos: [IsoDate, IsoDate, IsoDate, IsoDate] = [
    primeiro,
    addDaysIso(primeiro, 7),
    addDaysIso(primeiro, 14),
    quarto,
  ];
  const fim = (year + 1) % 3;
  const ciclo: Ciclo = fim === 1 ? 'A' : fim === 2 ? 'B' : 'C';
  const dez8 = `${year}-12-${pad(8)}`;
  const imaculada = fromIso(dez8).getDay() === 0 ? `${year}-12-09` : dez8;
  return {
    anoAdvento: year,
    domingos,
    natal,
    ciclo,
    imaculada,
    feriasMaiores: `${year}-12-17`,
    totalDias: diffDays(natal, primeiro) + 1,
  };
}

export interface LiturgicalDay {
  data: IsoDate;
  season: Season;
  cal: AdventCalendar;
  /** 1..4 durante o Advento. */
  semana?: number;
  /** 1..N: dia corrido da jornada (1º Domingo = 1, Natal = último). */
  diaDaJornada?: number;
  isDomingo: boolean;
  isGaudete: boolean;
  diasParaNatal: number;
  diasParaAdvento: number;
  /** Rótulo curto: "1ª semana do Advento", "Natal do Senhor"… */
  rotulo: string;
}

/**
 * Identifica a data litúrgica. Para datas entre janeiro e o início do Advento,
 * usa o Advento do ano corrente; depois do Natal, usa o Advento do próprio ano.
 */
export function liturgicalDay(data: IsoDate): LiturgicalDay {
  const year = fromIso(data).getFullYear();
  const cal = adventCalendar(year);
  const [d1] = cal.domingos;
  const isDomingo = fromIso(data).getDay() === 0;
  const diasParaNatal = diffDays(cal.natal, data);
  const diasParaAdvento = diffDays(d1, data);

  if (diasParaAdvento > 0) {
    return {
      data, cal, isDomingo, isGaudete: false, diasParaNatal, diasParaAdvento,
      season: 'antes-do-advento',
      rotulo: diasParaAdvento === 1 ? 'Amanhã começa o Advento' : `Faltam ${diasParaAdvento} dias para o Advento`,
    };
  }
  if (diasParaNatal > 0) {
    const semana = Math.min(4, Math.floor(diffDays(data, d1) / 7) + 1);
    const isGaudete = data === cal.domingos[2];
    const rotulo = isDomingo
      ? `${semana}º Domingo do Advento${isGaudete ? ' · Gaudete' : ''}`
      : data >= cal.feriasMaiores
        ? `${semana}ª semana do Advento · ${fromIso(data).getDate()} de dezembro`
        : `${semana}ª semana do Advento`;
    return {
      data, cal, semana, isDomingo, isGaudete, diasParaNatal, diasParaAdvento,
      diaDaJornada: diffDays(data, d1) + 1,
      season: 'advento',
      rotulo,
    };
  }
  if (diasParaNatal === 0) {
    return {
      data, cal, isDomingo, isGaudete: false, diasParaNatal, diasParaAdvento,
      diaDaJornada: cal.totalDias,
      season: 'natal',
      rotulo: 'Natal do Senhor',
    };
  }
  return {
    data, cal, isDomingo, isGaudete: false, diasParaNatal, diasParaAdvento,
    season: 'tempo-do-natal',
    rotulo: 'Tempo do Natal',
  };
}

/** Dias da jornada (1º Domingo do Advento até o Natal), em ordem. */
export function journeyDates(year: number): IsoDate[] {
  const cal = adventCalendar(year);
  return Array.from({ length: cal.totalDias }, (_, i) => addDaysIso(cal.domingos[0], i));
}

/** Ano do Advento cuja jornada deve ser exibida para uma data (antes do Advento → o deste ano). */
export function journeyYearFor(data: IsoDate): number {
  return fromIso(data).getFullYear();
}

/** Período sugerido da Novena de Natal: 16 a 24 de dezembro. */
export function novenaDates(year: number): IsoDate[] {
  return Array.from({ length: 9 }, (_, i) => `${year}-12-${pad(16 + i)}`);
}
