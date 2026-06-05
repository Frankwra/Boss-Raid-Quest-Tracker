import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../../src/lib/prisma.js';
import { QuestRepositoryPrisma } from '../../../../src/repositories/prisma/quest.repository.prisma.js';
import { ResourceNotFoundError } from '../../../../src/errors/resource-not-found.error.js';

vi.mock('../../../../src/lib/prisma.js', () => ({
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

function makePrismaP2025(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Record to update not found.', {
    code: 'P2025',
    clientVersion: '6.19.3',
  });
}

describe('QuestRepositoryPrisma', () => {
  let repository: QuestRepositoryPrisma;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new QuestRepositoryPrisma();
  });

  describe('create', () => {
    it('deve chamar prisma.quest.create com os dados', async () => {
      const data = { titulo: 'Derrotar Dragão', xp: 100 };
      const quest = { id: 'uuid-1', ...data };
      vi.mocked(prisma.quest.create).mockResolvedValue(quest as never);

      const result = await repository.create(data);

      expect(prisma.quest.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(quest);
    });
  });

  describe('findAll', () => {
    it('deve chamar prisma.quest.findMany sem argumentos', async () => {
      vi.mocked(prisma.quest.findMany).mockResolvedValue([]);

      const result = await repository.findAll();

      expect(prisma.quest.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('deve chamar prisma.quest.findUnique com where: { id }', async () => {
      const quest = { id: 'uuid-1' };
      vi.mocked(prisma.quest.findUnique).mockResolvedValue(quest as never);

      const result = await repository.findById('uuid-1');

      expect(prisma.quest.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toBe(quest);
    });

    it('deve retornar null quando a quest não existe', async () => {
      vi.mocked(prisma.quest.findUnique).mockResolvedValue(null);

      const result = await repository.findById('uuid-inexistente');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve chamar prisma.quest.update com where e data', async () => {
      const quest = { id: 'uuid-1', titulo: 'Novo' };
      vi.mocked(prisma.quest.update).mockResolvedValue(quest as never);

      const result = await repository.update('uuid-1', { titulo: 'Novo' });

      expect(prisma.quest.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { titulo: 'Novo' },
      });
      expect(result).toBe(quest);
    });

    it('deve traduzir Prisma P2025 para ResourceNotFoundError', async () => {
      vi.mocked(prisma.quest.update).mockRejectedValue(makePrismaP2025());

      await expect(repository.update('uuid-inexistente', { titulo: 'X' })).rejects.toBeInstanceOf(
        ResourceNotFoundError
      );
    });

    it('deve propagar outros erros do Prisma', async () => {
      const error = new Error('DB offline');
      vi.mocked(prisma.quest.update).mockRejectedValue(error);

      await expect(repository.update('uuid-1', { titulo: 'X' })).rejects.toThrow('DB offline');
    });
  });

  describe('delete', () => {
    it('deve chamar prisma.quest.delete com where: { id }', async () => {
      vi.mocked(prisma.quest.delete).mockResolvedValue(undefined);

      await repository.delete('uuid-1');

      expect(prisma.quest.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });

    it('deve traduzir Prisma P2025 para ResourceNotFoundError', async () => {
      vi.mocked(prisma.quest.delete).mockRejectedValue(makePrismaP2025());

      await expect(repository.delete('uuid-inexistente')).rejects.toBeInstanceOf(
        ResourceNotFoundError
      );
    });

    it('deve propagar outros erros do Prisma', async () => {
      const error = new Error('DB offline');
      vi.mocked(prisma.quest.delete).mockRejectedValue(error);

      await expect(repository.delete('uuid-1')).rejects.toThrow('DB offline');
    });
  });
});
