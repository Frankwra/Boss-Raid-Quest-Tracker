import { z } from 'zod';

export const createQuestBodySchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  xp: z.number().int().min(0),
});

export type CreateQuestBody = z.infer<typeof createQuestBodySchema>;

export const updateQuestBodySchema = z
  .object({
    titulo: z.string().min(1).optional(),
    descricao: z.string().optional(),
    xp: z.number().int().min(0).optional(),
    concluida: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido',
  });

export type UpdateQuestBody = z.infer<typeof updateQuestBodySchema>;
