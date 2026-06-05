import { z } from 'zod';

export const createQuestBodySchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  xp: z.number().int().min(0),
});

export type CreateQuestBody = z.infer<typeof createQuestBodySchema>;
