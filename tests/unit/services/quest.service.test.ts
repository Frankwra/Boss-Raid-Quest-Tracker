import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Quest } from '@prisma/client';
import { prisma } from '../../../src/lib/prisma.js';
import { questService } from '../../../src/services/quest.service.js';

vi.mock('../../../src/lib/prisma.js', () => ({
  prisma: {
    quest: {
      create: vi.fn(),
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
});
