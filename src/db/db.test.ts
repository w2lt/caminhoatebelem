import { describe, expect, it } from 'vitest';
import Dexie from 'dexie';
import { AppDB, db } from './database';
import { createEvent, deleteEvent, nextEvent, sortChronological, splitUpcomingPast, updateEvent, validateEvent, EMPTY_EVENT } from './events';
import { getSettings, setSetting, DEFAULT_SETTINGS } from './settings';
import { toggleMark, addIntention } from './progress';
import { emptyCircle, saveCircle, toggleMeetingDone } from './circle';

describe('agenda (CRUD)', () => {
  it('valida campos obrigatórios com mensagens claras', () => {
    const r = validateEvent({ ...EMPTY_EVENT, title: '', date: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.title).toBe('Informe um título');
      expect(r.errors.date).toBe('Escolha a data');
    }
  });

  it('cria, edita, ordena e exclui', async () => {
    const a = await createEvent({ ...EMPTY_EVENT, title: 'Missa', date: '2026-12-06', time: '10:00' });
    const b = await createEvent({ ...EMPTY_EVENT, title: 'Confissão', category: 'confissao', date: '2026-12-02', time: '19:00' });
    await updateEvent(a.id, { ...EMPTY_EVENT, title: 'Missa do 2º Domingo', date: '2026-12-06', time: '08:00' });
    const all = await db.events.toArray();
    expect(sortChronological(all).map((e) => e.title)).toEqual(['Confissão', 'Missa do 2º Domingo']);
    await deleteEvent(b.id);
    expect(await db.events.count()).toBe(1);
  });

  it('remove caracteres de controle e limita tamanho', async () => {
    const e = await createEvent({ ...EMPTY_EVENT, title: '  Novena\u0000 ', date: '2026-12-16' });
    expect(e.title).toBe('Novena');
    expect(validateEvent({ ...EMPTY_EVENT, title: 'x'.repeat(200), date: '2026-12-16' }).ok).toBe(false);
  });

  it('destaca o próximo compromisso e separa passados', async () => {
    await createEvent({ ...EMPTY_EVENT, title: 'Passado', date: '2026-12-01', time: '10:00' });
    await createEvent({ ...EMPTY_EVENT, title: 'Cancelado', date: '2026-12-10', time: '10:00', status: 'cancelado' });
    await createEvent({ ...EMPTY_EVENT, title: 'Próximo', date: '2026-12-12', time: '' });
    const all = await db.events.toArray();
    const now = new Date(2026, 11, 5, 12).getTime();
    expect(nextEvent(all, now)?.title).toBe('Próximo');
    const { upcoming, past } = splitUpcomingPast(all, now);
    expect(past.map((e) => e.title)).toEqual(['Passado']);
    expect(upcoming).toHaveLength(2);
  });
});

describe('preferências, progresso e novena', () => {
  it('preferências têm padrão e são validadas', async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
    await setSetting('fontSize', 'extra');
    expect((await getSettings()).fontSize).toBe('extra');
    // valor corrompido no banco é ignorado
    await db.settings.put({ key: 'highContrast', value: 'sim' });
    expect((await getSettings()).highContrast).toBe(false);
    await expect(setSetting('fontSize', 'gigante' as never)).rejects.toThrow();
  });

  it('marcação de oração é alternável', async () => {
    expect(await toggleMark('manha', '2026-12-01')).toBe(true);
    expect(await db.progress.get('manha:2026-12-01')).toBeDefined();
    expect(await toggleMark('manha', '2026-12-01')).toBe(false);
  });

  it('intenções', async () => {
    await expect(addIntention(' ', 1)).rejects.toThrow('Escreva a intenção');
    await addIntention('Pela saúde da vovó', 3);
    expect(await db.intentions.where('encounter').equals(3).count()).toBe(1);
  });

  it('Círculo Bíblico: nove encontros, marcação e validação', async () => {
    const c = emptyCircle(2026);
    c.name = 'Círculo São José';
    await saveCircle(c);
    await toggleMeetingDone(2);
    const saved = await db.circle.get('principal');
    expect(saved?.meetings).toHaveLength(9);
    expect(saved?.meetings[1]?.done).toBe(true);
    await expect(saveCircle({ ...c, meetings: c.meetings.slice(0, 3) })).rejects.toThrow();
  });

  it('Círculo Bíblico: tema do encontro é salvo e registros antigos sem tema continuam válidos', async () => {
    const c = emptyCircle(2026);
    c.meetings[0]!.theme = '  O sim de Maria ';
    await saveCircle(c);
    expect((await db.circle.get('principal'))?.meetings[0]?.theme).toBe('O sim de Maria');
    // registro antigo (sem o campo theme)
    const antigo = { ...c, meetings: c.meetings.map(({ theme: _t, ...m }) => m) };
    await saveCircle(antigo);
    expect((await db.circle.get('principal'))?.meetings[0]?.theme).toBe('');
    await expect(saveCircle({ ...c, meetings: c.meetings.map((m) => ({ ...m, theme: 'x'.repeat(161) })) })).rejects.toThrow();
  });

  it('mudar a modalidade da novena não apaga o Círculo', async () => {
    await saveCircle({ ...emptyCircle(2026), name: 'Grupo' });
    await setSetting('novenaMode', 'circulo');
    await setSetting('novenaMode', 'app');
    expect((await db.circle.get('principal'))?.name).toBe('Grupo');
  });
});

describe('migração do banco', () => {
  it('v1 → v2 define status e endereço nos eventos antigos', async () => {
    const name = 'migracao-teste';
    await Dexie.delete(name);
    const v1 = new Dexie(name);
    v1.version(1).stores({ settings: 'key', events: 'id, date, category', progress: 'id, kind, at', intentions: 'id, encounter, createdAt', circle: 'id', pdfs: 'id, addedAt', songs: 'id, addedAt' });
    await v1.open();
    await v1.table('events').add({ id: 'x', title: 'Antigo', category: 'missa', date: '2026-12-01', time: '' });
    v1.close();

    const v2 = new AppDB(name);
    await v2.open();
    const ev = await v2.events.get('x');
    expect(ev?.status).toBe('agendado');
    expect(ev?.address).toBe('');
    expect(v2.verno).toBe(2);
    v2.close();
    await Dexie.delete(name);
  });
});
