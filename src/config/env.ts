import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL deve ser uma URL válida')
    .refine((url) => url.startsWith('postgresql://'), {
      message: 'DATABASE_URL deve usar o protocolo postgresql://',
    }),
  POSTGRES_USER: z.string().min(1, 'POSTGRES_USER é obrigatório'),
  POSTGRES_PASSWORD: z.string().min(1, 'POSTGRES_PASSWORD é obrigatório'),
  POSTGRES_DB: z.string().min(1, 'POSTGRES_DB é obrigatório'),
  POSTGRES_PORT: z
    .string()
    .regex(/^\d+$/, 'POSTGRES_PORT deve ser numérico')
    .default('5432'),
  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT deve ser numérico')
    .default('3333'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z
    .string()
    .url('FRONTEND_URL deve ser uma URL válida')
    .default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
