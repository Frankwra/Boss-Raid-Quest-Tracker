import { Prisma, type Quest } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ResourceNotFoundError } from '../errors/resource-not-found.error.js';
import type { CreateQuestBody, UpdateQuestBody } from '../schemas/quest.schema.js';

function isRecordNotFound(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

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

  async update(id: string, data: UpdateQuestBody): Promise<Quest> {
    try {
      return await prisma.quest.update({ where: { id }, data });
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new ResourceNotFoundError('Quest', id);
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.quest.delete({ where: { id } });
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new ResourceNotFoundError('Quest', id);
      }
      throw error;
    }
  },
};
