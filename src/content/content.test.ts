import { describe, expect, it } from 'vitest';
import { PACOTES, diaPorData, liturgiaPorData, validarPacote } from './index';
import { journeyDates } from '../domain/liturgical';
import { novena } from './novena';
import { canticos, canticoById } from './canticos';
import { encontroNovena, cantico } from './schema';

describe('conteúdo diário 2026', () => {
  const pacote = PACOTES[2026]!;

  it('o pacote é válido pelo esquema', () => {
    expect(() => validarPacote(pacote)).not.toThrow();
  });

  it('há um registro para CADA data de 29/11 a 25/12, com liturgia correspondente', () => {
    for (const data of journeyDates(2026)) {
      const dia = diaPorData(data);
      expect(dia, data).toBeDefined();
      expect(liturgiaPorData(dia!.liturgiaId), data).toBeDefined();
    }
    expect(pacote.dias).toHaveLength(27);
    expect(pacote.liturgia).toHaveLength(27);
  });

  it('não há conteúdo genérico repetido entre os dias', () => {
    for (const campo of ['tema', 'manha', 'noite', 'reflexao', 'frase', 'gesto', 'familia'] as const) {
      const valores = pacote.dias.map((d) => d[campo]);
      expect(new Set(valores).size, campo).toBe(valores.length);
    }
  });

  it('nenhuma frase é atribuída a santos, papas ou à Bíblia', () => {
    for (const d of pacote.dias) {
      expect(d.frase).not.toMatch(/(São|Santa|Papa|Jo |Lc |Mt |Mc |\d+,\d+)/);
    }
  });

  it('domingos e solenidades com segunda leitura; cores corretas', () => {
    expect(liturgiaPorData('2026-11-29')!.missas[0]!.leituras.map((l) => l.tipo)).toContain('2ª Leitura');
    expect(liturgiaPorData('2026-12-13')!.cor).toBe('rosa');
    expect(liturgiaPorData('2026-12-08')!.cor).toBe('branco');
    expect(liturgiaPorData('2026-11-30')!.cor).toBe('vermelho');
    expect(liturgiaPorData('2026-12-25')!.missas).toHaveLength(3);
    expect(liturgiaPorData('2026-12-24')!.missas).toHaveLength(2);
  });

  it('nenhuma leitura traz texto integral sem licença registrada', () => {
    for (const l of pacote.liturgia) for (const m of l.missas) for (const r of m.leituras) {
      if (r.textoIntegral) expect(r.textoIntegral.licenca.length).toBeGreaterThan(3);
      expect(r.textoIntegral).toBeUndefined();
    }
  });
});

describe('novena e cânticos', () => {
  it('nove encontros válidos, de 16 a 24/12, com cântico existente', () => {
    expect(novena).toHaveLength(9);
    novena.forEach((n, i) => {
      expect(() => encontroNovena.parse(n)).not.toThrow();
      expect(n.numero).toBe(i + 1);
      expect(n.dataSugerida).toBe(`2026-12-${16 + i}`);
      expect(canticoById(n.canticoId), n.canticoId).toBeDefined();
    });
  });

  it('letra só aparece em obra de domínio público ou licenciada', () => {
    for (const c of canticos) {
      expect(() => cantico.parse(c)).not.toThrow();
      if (c.letra) expect(c.direitos).not.toBe('protegido-sem-licenca');
    }
  });
});
