import type { Quest } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ResourceNotFoundError } from '../errors/resource-not-found.error.js';
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

  async findAll(): Promise<Quest[]> {
    return prisma.quest.findMany();
  },

  async findById(id: string): Promise<Quest> {
    const quest = await prisma.quest.findUnique({ where: { id } });
    if (!quest) {
      throw new ResourceNotFoundError('Quest', id);
    }
    return quest;
  },
};
