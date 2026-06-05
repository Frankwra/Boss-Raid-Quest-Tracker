import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import {
  createQuestBodySchema,
  type CreateQuestBody,
  updateQuestBodySchema,
  type UpdateQuestBody,
} from '../schemas/quest.schema.js';
import { questIdParamSchema } from '../schemas/quest-id.schema.js';
import { paginationQuerySchema } from '../schemas/pagination.schema.js';
import { questService } from '../services/quest.service.js';
import { ResourceNotFoundError } from '../errors/resource-not-found.error.js';

export async function questsRoutes(app: FastifyInstance) {
  app.post('/api/quests', async (request, reply) => {
    try {
      const data: CreateQuestBody = createQuestBodySchema.parse(request.body);
      const quest = await questService.create(data);
      return reply.status(201).send(quest);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: 'Dados inválidos',
          issues: error.issues,
        });
      }
      throw error;
    }
  });

  app.get('/api/quests', async (request, reply) => {
    try {
      const { page, limit } = paginationQuerySchema.parse(request.query);
      const result = await questService.findAll({ page, limit });
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: 'Dados inválidos',
          issues: error.issues,
        });
      }
      throw error;
    }
  });

  app.get<{ Params: { id: string } }>('/api/quests/:id', async (request, reply) => {
    try {
      const { id } = questIdParamSchema.parse(request.params);
      const quest = await questService.findById(id);
      return quest;
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: 'Dados inválidos',
          issues: error.issues,
        });
      }
      if (error instanceof ResourceNotFoundError) {
        return reply.status(404).send({
          message: error.message,
        });
      }
      throw error;
    }
  });

  app.patch<{ Params: { id: string } }>('/api/quests/:id', async (request, reply) => {
    try {
      const { id } = questIdParamSchema.parse(request.params);
      const data: UpdateQuestBody = updateQuestBodySchema.parse(request.body);
      const quest = await questService.update(id, data);
      return quest;
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: 'Dados inválidos',
          issues: error.issues,
        });
      }
      if (error instanceof ResourceNotFoundError) {
        return reply.status(404).send({ message: error.message });
      }
      throw error;
    }
  });

  app.delete<{ Params: { id: string } }>('/api/quests/:id', async (request, reply) => {
    try {
      const { id } = questIdParamSchema.parse(request.params);
      await questService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: 'Dados inválidos',
          issues: error.issues,
        });
      }
      if (error instanceof ResourceNotFoundError) {
        return reply.status(404).send({ message: error.message });
      }
      throw error;
    }
  });
}
