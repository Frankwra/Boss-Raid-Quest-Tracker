import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import type { Quest } from '@prisma/client';

vi.mock('../../../src/services/quest.service.js', () => ({
  questService: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { questService } from '../../../src/services/quest.service.js';
import { questsRoutes } from '../../../src/routes/quests.routes.js';
import { ResourceNotFoundError } from '../../../src/errors/resource-not-found.error.js';

const mockService = vi.mocked(questService);

const VALID_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_ID = '22222222-2222-4222-8222-222222222222';

function makeQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: VALID_ID,
    titulo: 'Derrotar dragão',
    descricao: 'Boss raid semanal',
    xp: 1000,
    concluida: false,
    criadoEm: new Date('2026-06-01T10:00:00Z'),
    atualizadoEm: new Date('2026-06-01T10:00:00Z'),
    deletadoEm: null,
    ...overrides,
  };
}

describe('questsRoutes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(questsRoutes);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/quests', () => {
    it('retorna 200 com lista de quests', async () => {
      mockService.findAll.mockResolvedValue([makeQuest(), makeQuest({ id: OTHER_ID })]);
      const res = await app.inject({ method: 'GET', url: '/api/quests' });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveLength(2);
      expect(mockService.findAll).toHaveBeenCalledOnce();
    });

    it('retorna 200 com lista vazia', async () => {
      mockService.findAll.mockResolvedValue([]);
      const res = await app.inject({ method: 'GET', url: '/api/quests' });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });
  });

  describe('GET /api/quests/:id', () => {
    it('retorna 200 com a quest', async () => {
      mockService.findById.mockResolvedValue(makeQuest());
      const res = await app.inject({ method: 'GET', url: `/api/quests/${VALID_ID}` });

      expect(res.statusCode).toBe(200);
      expect(res.json().id).toBe(VALID_ID);
    });

    it('retorna 400 para UUID inválido', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/quests/not-a-uuid' });

      expect(res.statusCode).toBe(400);
      expect(res.json().message).toBe('Dados inválidos');
      expect(res.json().issues).toBeDefined();
      expect(mockService.findById).not.toHaveBeenCalled();
    });

    it('retorna 404 quando não encontrado', async () => {
      mockService.findById.mockRejectedValue(new ResourceNotFoundError('Quest', VALID_ID));
      const res = await app.inject({ method: 'GET', url: `/api/quests/${VALID_ID}` });

      expect(res.statusCode).toBe(404);
      expect(res.json().message).toContain('Quest');
    });
  });

  describe('POST /api/quests', () => {
    it('retorna 201 com a quest criada', async () => {
      mockService.create.mockResolvedValue(makeQuest());
      const res = await app.inject({
        method: 'POST',
        url: '/api/quests',
        payload: { titulo: 'Nova quest', xp: 500 },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().id).toBe(VALID_ID);
      expect(mockService.create).toHaveBeenCalledWith({ titulo: 'Nova quest', xp: 500 });
    });

    it('retorna 201 com descricao opcional', async () => {
      mockService.create.mockResolvedValue(makeQuest());
      const res = await app.inject({
        method: 'POST',
        url: '/api/quests',
        payload: { titulo: 'Q', descricao: 'desc', xp: 100 },
      });

      expect(res.statusCode).toBe(201);
    });

    it('retorna 400 para body inválido (titulo vazio)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/quests',
        payload: { titulo: '', xp: 100 },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().message).toBe('Dados inválidos');
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('retorna 400 para body inválido (xp negativo)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/quests',
        payload: { titulo: 'A', xp: -10 },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /api/quests/:id', () => {
    it('retorna 200 com a quest atualizada', async () => {
      mockService.update.mockResolvedValue(makeQuest({ titulo: 'Atualizado' }));
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/quests/${VALID_ID}`,
        payload: { titulo: 'Atualizado' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().titulo).toBe('Atualizado');
    });

    it('retorna 400 para UUID inválido', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/quests/not-uuid',
        payload: { titulo: 'A' },
      });

      expect(res.statusCode).toBe(400);
      expect(mockService.update).not.toHaveBeenCalled();
    });

    it('retorna 400 para body vazio (refine)', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/quests/${VALID_ID}`,
        payload: {},
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().message).toBe('Dados inválidos');
    });

    it('retorna 404 quando não encontrado', async () => {
      mockService.update.mockRejectedValue(new ResourceNotFoundError('Quest', VALID_ID));
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/quests/${VALID_ID}`,
        payload: { titulo: 'A' },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/quests/:id', () => {
    it('retorna 204 ao deletar', async () => {
      mockService.delete.mockResolvedValue(undefined);
      const res = await app.inject({ method: 'DELETE', url: `/api/quests/${VALID_ID}` });

      expect(res.statusCode).toBe(204);
      expect(mockService.delete).toHaveBeenCalledWith(VALID_ID);
    });

    it('retorna 400 para UUID inválido', async () => {
      const res = await app.inject({ method: 'DELETE', url: '/api/quests/bad' });

      expect(res.statusCode).toBe(400);
      expect(mockService.delete).not.toHaveBeenCalled();
    });

    it('retorna 404 quando não encontrado', async () => {
      mockService.delete.mockRejectedValue(new ResourceNotFoundError('Quest', VALID_ID));
      const res = await app.inject({ method: 'DELETE', url: `/api/quests/${VALID_ID}` });

      expect(res.statusCode).toBe(404);
    });
  });
});
