import { z } from 'zod';

export const createQuestSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(120, 'Máximo 120 caracteres'),
  descricao: z.string().max(500, 'Máximo 500 caracteres').optional(),
  xp: z.coerce
    .number({ message: 'XP deve ser um número' })
    .int('XP deve ser inteiro')
    .min(0, 'XP não pode ser negativo'),
});

export type CreateQuestInput = z.infer<typeof createQuestSchema>;

export const updateQuestSchema = z
  .object({
    titulo: z.string().min(1).max(120).optional(),
    descricao: z.string().max(500).nullable().optional(),
    xp: z.coerce.number().int().min(0).optional(),
    concluida: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe pelo menos um campo',
  });

export type UpdateQuestInput = z.infer<typeof updateQuestSchema>;
