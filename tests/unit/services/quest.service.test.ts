import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Quest } from '@prisma/client';
import { QuestService } from '../../../src/services/quest.service.js';
import { ResourceNotFoundError } from '../../../src/errors/resource-not-found.error.js';
import type { QuestRepository } from '../../../src/repositories/quest.repository.js';

const mockRepository: QuestRepository = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

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
  let questService: QuestService;

  beforeEach(() => {
    vi.clearAllMocks();
    questService = new QuestService(mockRepository);
  });

  describe('create', () => {
    it('deve chamar repository.create com os campos corretos', async () => {
      const input = { titulo: 'Matar dragão', xp: 100 };
      const created = makeQuest({ id: 'uuid-1', titulo: input.titulo, xp: input.xp });
      vi.mocked(mockRepository.create).mockResolvedValue(created);

      const result = await questService.create(input);

      expect(mockRepository.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(created);
    });

    it('deve propagar erro do repository', async () => {
      const error = new Error('DB offline');
      vi.mocked(mockRepository.create).mockRejectedValue(error);

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
      vi.mocked(mockRepository.create).mockResolvedValue(created);

      const result = await questService.create(input);

      expect(mockRepository.create).toHaveBeenCalledWith(input);
      expect(result.descricao).toBe(input.descricao);
    });
  });

  describe('findAll', () => {
    it('deve chamar repository.findAll', async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue([]);

      const result = await questService.findAll();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('deve retornar lista de quests quando há registros', async () => {
      const quests = [
        makeQuest({ id: 'uuid-1', titulo: 'Quest 1' }),
        makeQuest({ id: 'uuid-2', titulo: 'Quest 2' }),
      ];
      vi.mocked(mockRepository.findAll).mockResolvedValue(quests);

      const result = await questService.findAll();

      expect(result).toEqual(quests);
    });
  });

  describe('findById', () => {
    it('deve chamar repository.findById com o id correto', async () => {
      const quest = makeQuest({ id: 'uuid-1', titulo: 'Quest 1' });
      vi.mocked(mockRepository.findById).mockResolvedValue(quest);

      const result = await questService.findById('uuid-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(quest);
    });

    it('deve lançar ResourceNotFoundError quando repository retorna null', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(questService.findById('uuid-inexistente')).rejects.toBeInstanceOf(
        ResourceNotFoundError
      );
    });
  });

  describe('update', () => {
    it('deve chamar repository.update com id e data', async () => {
      const id = 'uuid-1';
      const input = { titulo: 'Novo título', xp: 200 };
      const updated = makeQuest({ id, titulo: input.titulo, xp: input.xp });
      vi.mocked(mockRepository.update).mockResolvedValue(updated);

      const result = await questService.update(id, input);

      expect(mockRepository.update).toHaveBeenCalledWith(id, input);
      expect(result).toEqual(updated);
    });

    it('deve propagar ResourceNotFoundError do repository', async () => {
      vi.mocked(mockRepository.update).mockRejectedValue(
        new ResourceNotFoundError('Quest', 'uuid-inexistente')
      );

      await expect(
        questService.update('uuid-inexistente', { titulo: 'X' })
      ).rejects.toBeInstanceOf(ResourceNotFoundError);
    });

    it('deve propagar outros erros do repository', async () => {
      const error = new Error('DB offline');
      vi.mocked(mockRepository.update).mockRejectedValue(error);

      await expect(
        questService.update('uuid-1', { titulo: 'X' })
      ).rejects.toThrow('DB offline');
    });
  });

  describe('delete', () => {
    it('deve chamar repository.delete com id', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue();

      await questService.delete('uuid-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('deve propagar ResourceNotFoundError do repository', async () => {
      vi.mocked(mockRepository.delete).mockRejectedValue(
        new ResourceNotFoundError('Quest', 'uuid-inexistente')
      );

      await expect(questService.delete('uuid-inexistente')).rejects.toBeInstanceOf(
        ResourceNotFoundError
      );
    });

    it('deve propagar outros erros do repository', async () => {
      const error = new Error('DB offline');
      vi.mocked(mockRepository.delete).mockRejectedValue(error);

      await expect(questService.delete('uuid-1')).rejects.toThrow('DB offline');
    });
  });
});
