import { describe, it, expect } from 'vitest';
import { questIdParamSchema } from '../../../src/schemas/quest-id.schema.js';

describe('questIdParamSchema', () => {
  it('deve aceitar UUID válido', () => {
    const result = questIdParamSchema.parse({ id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('deve rejeitar string que não é UUID', () => {
    expect(() => questIdParamSchema.parse({ id: 'not-a-uuid' })).toThrow(
      /ID deve ser um UUID válido/
    );
  });

  it('deve rejeitar string vazia', () => {
    expect(() => questIdParamSchema.parse({ id: '' })).toThrow();
  });

  it('deve rejeitar objeto sem id', () => {
    expect(() => questIdParamSchema.parse({})).toThrow();
  });
});
