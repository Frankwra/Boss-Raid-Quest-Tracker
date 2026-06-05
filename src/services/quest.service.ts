import type { Quest } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { CreateQuestBody } from '../schemas/quest.schema.js';

export const questService = {
  async create(data: CreateQuestBody): Promise<Quest> {
    return prisma.quest.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        xp: data.xp,
      },
    });
  },
};
