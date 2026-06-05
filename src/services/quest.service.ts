import type { Quest } from '@prisma/client';
import { ResourceNotFoundError } from '../errors/resource-not-found.error.js';
import type { CreateQuestBody, UpdateQuestBody } from '../schemas/quest.schema.js';
import type { QuestRepository } from '../repositories/quest.repository.js';
import { QuestRepositoryPrisma } from '../repositories/prisma/quest.repository.prisma.js';

export class QuestService {
  private readonly repository: QuestRepository;

  constructor(repository: QuestRepository) {
    this.repository = repository;
  }

  async create(data: CreateQuestBody): Promise<Quest> {
    return this.repository.create(data);
  }

  async findAll(): Promise<Quest[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Quest> {
    const quest = await this.repository.findById(id);
    if (!quest) {
      throw new ResourceNotFoundError('Quest', id);
    }
    return quest;
  }

  async update(id: string, data: UpdateQuestBody): Promise<Quest> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

const questRepository = new QuestRepositoryPrisma();
export const questService = new QuestService(questRepository);
