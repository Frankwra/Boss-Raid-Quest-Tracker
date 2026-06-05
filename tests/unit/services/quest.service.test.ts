import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma, type Quest } from '@prisma/client';
import { prisma } from '../../../src/lib/prisma.js';
import { questService } from '../../../src/services/quest.service.js';
import { ResourceNotFoundError } from '../../../src/errors/resource-not-found.error.js';

vi.mock('../../../src/lib/prisma.js', () => ({
  prisma: {
    quest: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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

function makePrismaP2025(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Record to update not found.', {
    code: 'P2025',
    clientVersion: '6.19.3',
  });
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

  describe('update', () => {
    it('deve chamar prisma.quest.update com where e data', async () => {
      const id = 'uuid-1';
      const input = { titulo: 'Novo título', xp: 200 };
      const updated = makeQuest({ id, titulo: input.titulo, xp: input.xp });
      vi.mocked(prisma.quest.update).mockResolvedValue(updated);

      const result = await questService.update(id, input);

      expect(prisma.quest.update).toHaveBeenCalledWith({
        where: { id },
        data: input,
      });
      expect(result).toEqual(updated);
    });

    it('deve lançar ResourceNotFoundError quando Prisma devolve P2025', async () => {
      vi.mocked(prisma.quest.update).mockRejectedValue(makePrismaP2025());

      await expect(
        questService.update('uuid-inexistente', { titulo: 'X' })
      ).rejects.toBeInstanceOf(ResourceNotFoundError);
    });

    it('deve propagar outros erros do Prisma', async () => {
      const error = new Error('DB offline');
      vi.mocked(prisma.quest.update).mockRejectedValue(error);

      await expect(
        questService.update('uuid-1', { titulo: 'X' })
      ).rejects.toThrow('DB offline');
    });
  });

  describe('delete', () => {
    it('deve chamar prisma.quest.delete com where: { id }', async () => {
      vi.mocked(prisma.quest.delete).mockResolvedValue(makeQuest({ id: 'uuid-1' }));

      await questService.delete('uuid-1');

      expect(prisma.quest.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });

    it('deve lançar ResourceNotFoundError quando Prisma devolve P2025', async () => {
      vi.mocked(prisma.quest.delete).mockRejectedValue(makePrismaP2025());

      await expect(questService.delete('uuid-inexistente')).rejects.toBeInstanceOf(
        ResourceNotFoundError
      );
    });

    it('deve propagar outros erros do Prisma', async () => {
      const error = new Error('DB offline');
      vi.mocked(prisma.quest.delete).mockRejectedValue(error);

      await expect(questService.delete('uuid-1')).rejects.toThrow('DB offline');
    });
  });
});
