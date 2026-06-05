import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { createQuestBodySchema, type CreateQuestBody } from '../schemas/quest.schema.js';
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

  app.get('/api/quests', async () => {
    const quests = await questService.findAll();
    return quests;
  });

  app.get<{ Params: { id: string } }>('/api/quests/:id', async (request, reply) => {
    try {
      const quest = await questService.findById(request.params.id);
      return quest;
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return reply.status(404).send({
          message: error.message,
        });
      }
      throw error;
    }
  });
}
