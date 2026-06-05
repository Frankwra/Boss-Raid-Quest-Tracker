import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { createQuestBodySchema, type CreateQuestBody } from '../schemas/quest.schema.js';
import { questService } from '../services/quest.service.js';

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
}
