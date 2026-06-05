import { describe, it, expect } from 'vitest';
import { computeStats, filterQuests, type QuestStats } from '@/lib/stats';
import type { Quest } from '@/types/quest';

function makeQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: crypto.randomUUID(),
    titulo: 'Quest',
    descricao: null,
    xp: 100,
    concluida: false,
    criadoEm: '2026-06-01T00:00:00.000Z',
    atualizadoEm: '2026-06-01T00:00:00.000Z',
    deletadoEm: null,
    ...overrides,
  };
}

describe('computeStats', () => {
  it('retorna zeros para lista vazia', () => {
    const expected: QuestStats = {
      total: 0,
      concluidas: 0,
      pendentes: 0,
      xpTotal: 0,
      xpGanho: 0,
      progresso: 0,
    };
    expect(computeStats([])).toEqual(expected);
  });

  it('conta total, pendentes e concluidas corretamente', () => {
    const quests = [
      makeQuest({ concluida: true }),
      makeQuest({ concluida: true }),
      makeQuest({ concluida: false }),
      makeQuest({ concluida: false }),
      makeQuest({ concluida: false }),
    ];
    const stats = computeStats(quests);
    expect(stats.total).toBe(5);
    expect(stats.concluidas).toBe(2);
    expect(stats.pendentes).toBe(3);
  });

  it('soma xp total e xp ganho (apenas concluidas)', () => {
    const quests = [
      makeQuest({ xp: 100, concluida: true }),
      makeQuest({ xp: 200, concluida: false }),
      makeQuest({ xp: 300, concluida: true }),
    ];
    const stats = computeStats(quests);
    expect(stats.xpTotal).toBe(600);
    expect(stats.xpGanho).toBe(400);
  });

  it('calcula progresso como percentual arredondado', () => {
    const quests = [
      makeQuest({ concluida: true }),
      makeQuest({ concluida: true }),
      makeQuest({ concluida: false }),
    ];
    expect(computeStats(quests).progresso).toBe(67);
  });

  it('progresso e 0 quando nao ha quests', () => {
    expect(computeStats([]).progresso).toBe(0);
  });

  it('progresso e 100 quando todas concluidas', () => {
    const quests = [makeQuest({ concluida: true }), makeQuest({ concluida: true })];
    expect(computeStats(quests).progresso).toBe(100);
  });

  it('progresso e 0 quando nenhuma concluida', () => {
    const quests = [makeQuest({ concluida: false }), makeQuest({ concluida: false })];
    expect(computeStats(quests).progresso).toBe(0);
  });

  it('arredondamento do progresso: 1 de 3 = 33%', () => {
    const quests = [makeQuest({ concluida: true }), makeQuest({ concluida: false }), makeQuest({ concluida: false })];
    expect(computeStats(quests).progresso).toBe(33);
  });
});

describe('filterQuests', () => {
  const quests: Quest[] = [
    makeQuest({ titulo: 'Derrotar dragão', concluida: true }),
    makeQuest({ titulo: 'Coletar cristais', concluida: false }),
    makeQuest({ titulo: 'Limpar masmorra', concluida: false }),
    makeQuest({ titulo: 'Derrotar esqueleto', concluida: true }),
  ];

  it('retorna todas quando busca vazia e status todas', () => {
    expect(filterQuests(quests, '', 'todas')).toHaveLength(4);
  });

  it('filtra por busca case-insensitive', () => {
    const result = filterQuests(quests, 'DRAGÃO', 'todas');
    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe('Derrotar dragão');
  });

  it('filtra por busca com espacos nas pontas (trim)', () => {
    const result = filterQuests(quests, '  cristais  ', 'todas');
    expect(result).toHaveLength(1);
    expect(result[0].titulo).toBe('Coletar cristais');
  });

  it('filtra por status concluidas', () => {
    const result = filterQuests(quests, '', 'concluidas');
    expect(result).toHaveLength(2);
    expect(result.every((q) => q.concluida)).toBe(true);
  });

  it('filtra por status pendentes', () => {
    const result = filterQuests(quests, '', 'pendentes');
    expect(result).toHaveLength(2);
    expect(result.every((q) => !q.concluida)).toBe(true);
  });

  it('combina busca e status', () => {
    const result = filterQuests(quests, 'derrotar', 'concluidas');
    expect(result).toHaveLength(2);
    expect(result.every((q) => q.concluida && q.titulo.toLowerCase().includes('derrotar'))).toBe(true);
  });

  it('retorna vazio quando nada combina', () => {
    expect(filterQuests(quests, 'xyz', 'todas')).toEqual([]);
  });

  it('retorna lista vazia se input e vazio', () => {
    expect(filterQuests([], 'busca', 'todas')).toEqual([]);
  });
});
