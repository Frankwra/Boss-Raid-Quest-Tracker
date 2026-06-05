import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Quest } from '@prisma/client';
import { prisma } from '../../../src/lib/prisma.js';
import { questService } from '../../../src/services/quest.service.js';
import { ResourceNotFoundError } from '../../../src/errors/resource-not-found.error.js';

vi.mock('../../../src/lib/prisma.js', () => ({
  prisma: {
    quest: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

function makeQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'uuid-default',
    titulo: 'Default',
    descricao: null,
    xp: 0,
    concluida: false,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

describe('QuestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('deve chamar prisma.quest.create com os campos corretos', async () => {
      const input = { titulo: 'Matar dragão', xp: 100 };
      const created = makeQuest({ id: 'uuid-1', titulo: input.titulo, xp: input.xp });
      vi.mocked(prisma.quest.create).mockResolvedValue(created);

      const result = await questService.create(input);

      expect(prisma.quest.create).toHaveBeenCalledWith({
        data: { titulo: input.titulo, descricao: undefined, xp: input.xp },
      });
      expect(result).toEqual(created);
    });

    it('deve propagar erro do Prisma', async () => {
      const error = new Error('DB offline');
      vi.mocked(prisma.quest.create).mockRejectedValue(error);

      await expect(
        questService.create({ titulo: 'Teste', xp: 10 })
      ).rejects.toThrow('DB offline');
    });

    it('deve aceitar descricao opcional', async () => {
      const input = { titulo: 'Side quest', descricao: 'Coletar ervas', xp: 5 };
      const created = makeQuest({
        id: 'uuid-2',
        titulo: input.titulo,
        descricao: input.descricao,
        xp: input.xp,
      });
      vi.mocked(prisma.quest.create).mockResolvedValue(created);

      const result = await questService.create(input);

      expect(prisma.quest.create).toHaveBeenCalledWith({
        data: { titulo: input.titulo, descricao: input.descricao, xp: input.xp },
      });
      expect(result.descricao).toBe(input.descricao);
    });
  });

  describe('findAll', () => {
    it('deve chamar prisma.quest.findMany', async () => {
      vi.mocked(prisma.quest.findMany).mockResolvedValue([]);

      const result = await questService.findAll();

      expect(prisma.quest.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });

    it('deve retornar lista de quests quando há registros', async () => {
      const quests = [
        makeQuest({ id: 'uuid-1', titulo: 'Quest 1' }),
        makeQuest({ id: 'uuid-2', titulo: 'Quest 2' }),
      ];
      vi.mocked(prisma.quest.findMany).mockResolvedValue(quests);

      const result = await questService.findAll();

      expect(result).toEqual(quests);
    });
  });

  describe('findById', () => {
    it('deve chamar prisma.quest.findUnique com o id correto', async () => {
      const quest = makeQuest({ id: 'uuid-1', titulo: 'Quest 1' });
      vi.mocked(prisma.quest.findUnique).mockResolvedValue(quest);

      const result = await questService.findById('uuid-1');

      expect(prisma.quest.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toEqual(quest);
    });

    it('deve lançar ResourceNotFoundError quando não encontrada', async () => {
      vi.mocked(prisma.quest.findUnique).mockResolvedValue(null);

      await expect(questService.findById('uuid-inexistente')).rejects.toBeInstanceOf(
        ResourceNotFoundError
      );
    });
  });
});
