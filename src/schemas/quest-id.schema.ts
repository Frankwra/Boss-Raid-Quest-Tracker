import { z } from 'zod';

export const questIdParamSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

export type QuestIdParam = z.infer<typeof questIdParamSchema>;
