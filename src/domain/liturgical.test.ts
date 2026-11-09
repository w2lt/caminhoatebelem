import { describe, expect, it } from 'vitest';
import { adventCalendar, journeyDates, liturgicalDay, novenaDates } from './liturgical';

describe('cálculo do Advento', () => {
  it('2026: domingos 29/11, 06/12, 13/12, 20/12 e Natal 25/12 (Ano B)', () => {
    const c = adventCalendar(2026);
    expect(c.domingos).toEqual(['2026-11-29', '2026-12-06', '2026-12-13', '2026-12-20']);
    expect(c.natal).toBe('2026-12-25');
    expect(c.ciclo).toBe('B');
    expect(c.totalDias).toBe(27);
    expect(c.imaculada).toBe('2026-12-08');
  });

  it.each([
    [2023, '2023-12-03', 'B'], // Natal numa segunda-feira: 4º domingo em 24/12
    [2024, '2024-12-01', 'C'],
    [2025, '2025-11-30', 'A'],
    [2027, '2027-11-28', 'C'],
    [2022, '2022-11-27', 'A'], // Natal num domingo: 4º domingo em 18/12
  ])('Advento de %i começa em %s (ciclo %s)', (ano, inicio, ciclo) => {
    const c = adventCalendar(ano);
    expect(c.domingos[0]).toBe(inicio);
    expect(c.ciclo).toBe(ciclo);
  });

  it('o 1º Domingo sempre cai entre 27/11 e 03/12, num domingo', () => {
    for (let y = 2020; y <= 2060; y++) {
      const d1 = adventCalendar(y).domingos[0];
      expect(d1 >= `${y}-11-27` && d1 <= `${y}-12-03`).toBe(true);
      expect(new Date(`${d1}T12:00:00`).getDay()).toBe(0);
    }
  });

  it('Natal num domingo → 4º domingo em 18/12', () => {
    expect(adventCalendar(2022).domingos[3]).toBe('2022-12-18');
  });

  it('Imaculada transferida para 9/12 quando 8/12 cai em domingo (Brasil)', () => {
    expect(adventCalendar(2024).imaculada).toBe('2024-12-09');
    expect(adventCalendar(2030).imaculada).toBe('2030-12-09');
  });
});

describe('identificação da data litúrgica', () => {
  it('antes do Advento mostra contagem', () => {
    const d = liturgicalDay('2026-11-08');
    expect(d.season).toBe('antes-do-advento');
    expect(d.diasParaAdvento).toBe(21);
    expect(d.diasParaNatal).toBe(47);
  });

  it('1º domingo, Gaudete, férias maiores e Natal', () => {
    expect(liturgicalDay('2026-11-29')).toMatchObject({ season: 'advento', semana: 1, diaDaJornada: 1, isDomingo: true, rotulo: '1º Domingo do Advento' });
    expect(liturgicalDay('2026-12-13')).toMatchObject({ semana: 3, isGaudete: true });
    expect(liturgicalDay('2026-12-18').rotulo).toContain('18 de dezembro');
    expect(liturgicalDay('2026-12-24')).toMatchObject({ semana: 4, diasParaNatal: 1 });
    expect(liturgicalDay('2026-12-25')).toMatchObject({ season: 'natal', diaDaJornada: 27 });
    expect(liturgicalDay('2026-12-26').season).toBe('tempo-do-natal');
  });

  it('jornada e novena', () => {
    const j = journeyDates(2026);
    expect(j).toHaveLength(27);
    expect(j[0]).toBe('2026-11-29');
    expect(j.at(-1)).toBe('2026-12-25');
    expect(novenaDates(2026)).toEqual(['2026-12-16', '2026-12-17', '2026-12-18', '2026-12-19', '2026-12-20', '2026-12-21', '2026-12-22', '2026-12-23', '2026-12-24']);
  });
});
