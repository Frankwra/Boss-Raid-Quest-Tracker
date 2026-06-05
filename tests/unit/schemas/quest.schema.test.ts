import { describe, it, expect } from 'vitest';
import { createQuestBodySchema, updateQuestBodySchema } from '../../../src/schemas/quest.schema.js';

describe('createQuestBodySchema', () => {
  it('aceita body válido com campos obrigatórios', () => {
    const result = createQuestBodySchema.parse({
      titulo: 'Derrotar dragão',
      xp: 1000,
    });
    expect(result).toEqual({ titulo: 'Derrotar dragão', xp: 1000 });
  });

  it('aceita body com descricao opcional', () => {
    const result = createQuestBodySchema.parse({
      titulo: 'Coletar ervas',
      descricao: 'Reunir 10 ervas medicinais',
      xp: 100,
    });
    expect(result.descricao).toBe('Reunir 10 ervas medicinais');
  });

  it('rejeita título vazio', () => {
    expect(() => createQuestBodySchema.parse({ titulo: '', xp: 100 })).toThrow();
  });

  it('rejeita título ausente', () => {
    expect(() => createQuestBodySchema.parse({ xp: 100 })).toThrow();
  });

  it('rejeita xp negativo', () => {
    expect(() => createQuestBodySchema.parse({ titulo: 'A', xp: -1 })).toThrow();
  });

  it('rejeita xp não inteiro', () => {
    expect(() => createQuestBodySchema.parse({ titulo: 'A', xp: 1.5 })).toThrow();
  });

  it('rejeita xp ausente', () => {
    expect(() => createQuestBodySchema.parse({ titulo: 'A' })).toThrow();
  });

  it('rejeita xp com tipo errado (string)', () => {
    expect(() => createQuestBodySchema.parse({ titulo: 'A', xp: '100' })).toThrow();
  });
});

describe('updateQuestBodySchema', () => {
  it('aceita update parcial com 1 campo', () => {
    const result = updateQuestBodySchema.parse({ titulo: 'Novo título' });
    expect(result).toEqual({ titulo: 'Novo título' });
  });

  it('aceita update parcial com múltiplos campos', () => {
    const result = updateQuestBodySchema.parse({ xp: 500, concluida: true });
    expect(result).toEqual({ xp: 500, concluida: true });
  });

  it('aceita update de concluida (false)', () => {
    const result = updateQuestBodySchema.parse({ concluida: false });
    expect(result).toEqual({ concluida: false });
  });

  it('rejeita body vazio (refine: pelo menos um campo)', () => {
    expect(() => updateQuestBodySchema.parse({})).toThrow(/Pelo menos um campo/);
  });

  it('rejeita titulo vazio quando enviado', () => {
    expect(() => updateQuestBodySchema.parse({ titulo: '' })).toThrow();
  });

  it('rejeita xp negativo quando enviado', () => {
    expect(() => updateQuestBodySchema.parse({ xp: -1 })).toThrow();
  });
});
