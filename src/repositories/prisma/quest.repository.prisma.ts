import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ResourceNotFoundError } from '../../errors/resource-not-found.error.js';
import type {
  CreateQuestData,
  QuestRepository,
  UpdateQuestData,
} from '../quest.repository.js';

function isRecordNotFound(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

export class QuestRepositoryPrisma implements QuestRepository {
  async create(data: CreateQuestData) {
    return prisma.quest.create({ data });
  }

  async findAll() {
    return prisma.quest.findMany({ where: { deletadoEm: null } });
  }

  async findById(id: string) {
    return prisma.quest.findUnique({ where: { id, deletadoEm: null } });
  }

  async update(id: string, data: UpdateQuestData) {
    try {
      return await prisma.quest.update({ where: { id, deletadoEm: null }, data });
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new ResourceNotFoundError('Quest', id);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.quest.update({
        where: { id, deletadoEm: null },
        data: { deletadoEm: new Date() },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        throw new ResourceNotFoundError('Quest', id);
      }
      throw error;
    }
  }
}
