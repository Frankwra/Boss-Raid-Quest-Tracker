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

export interface FindPaginatedParams {
  skip: number;
  take: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface QuestRepository {
  create(data: CreateQuestData): Promise<Quest>;
  findPaginated(params: FindPaginatedParams): Promise<PaginatedResult<Quest>>;
  findById(id: string): Promise<Quest | null>;
  update(id: string, data: UpdateQuestData): Promise<Quest>;
  delete(id: string): Promise<void>;
}
