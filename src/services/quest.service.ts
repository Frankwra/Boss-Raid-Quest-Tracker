import type { CreateQuestBody } from '../schemas/quest.schema.js';

export const questService = {
  async create(data: CreateQuestBody) {
    return { id: 'stub', ...data };
  },
};
