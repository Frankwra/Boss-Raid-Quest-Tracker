import type { Quest } from '@prisma/client';

export interface CreateQuestData {
  titulo: string;
  descricao?: string | null;
  xp: number;
  concluida?: boolean;
}

export interface UpdateQuestData {
  titulo?: string;
  descricao?: string | null;
  xp?: number;
  concluida?: boolean;
}

export interface QuestRepository {
  create(data: CreateQuestData): Promise<Quest>;
  findAll(): Promise<Quest[]>;
  findById(id: string): Promise<Quest | null>;
  update(id: string, data: UpdateQuestData): Promise<Quest>;
  delete(id: string): Promise<void>;
}
