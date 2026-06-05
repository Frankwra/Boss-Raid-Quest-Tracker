import { describe, it, expect } from 'vitest';
import { paginationQuerySchema } from '../../../src/schemas/pagination.schema.js';

describe('paginationQuerySchema', () => {
  it('aplica defaults quando query vem vazia', () => {
    const result = paginationQuerySchema.parse({});
    expect(result).toEqual({ page: 1, limit: 10 });
  });

  it('aceita page e limit validos como numeros', () => {
    const result = paginationQuerySchema.parse({ page: 3, limit: 25 });
    expect(result).toEqual({ page: 3, limit: 25 });
  });

  it('coerce strings para numeros (querystring vem como string)', () => {
    const result = paginationQuerySchema.parse({ page: '2', limit: '50' });
    expect(result).toEqual({ page: 2, limit: 50 });
  });

  it('rejeita page < 1', () => {
    expect(() => paginationQuerySchema.parse({ page: 0 })).toThrow();
    expect(() => paginationQuerySchema.parse({ page: -1 })).toThrow();
  });

  it('rejeita limit < 1', () => {
    expect(() => paginationQuerySchema.parse({ limit: 0 })).toThrow();
  });

  it('rejeita limit > 100', () => {
    expect(() => paginationQuerySchema.parse({ limit: 101 })).toThrow();
  });

  it('rejeita page nao-inteiro', () => {
    expect(() => paginationQuerySchema.parse({ page: 1.5 })).toThrow();
  });
});
