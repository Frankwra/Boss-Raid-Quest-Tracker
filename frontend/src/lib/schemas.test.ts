import { describe, it, expect } from 'vitest';
import { createQuestSchema, updateQuestSchema } from '@/lib/schemas';

describe('createQuestSchema', () => {
  it('aceita input valido', () => {
    const result = createQuestSchema.parse({
      titulo: 'Derrotar dragão',
      xp: 1000,
    });
    expect(result.titulo).toBe('Derrotar dragão');
    expect(result.xp).toBe(1000);
  });

  it('aceita descricao opcional', () => {
    const result = createQuestSchema.parse({
      titulo: 'Quest',
      descricao: 'descrição',
      xp: 100,
    });
    expect(result.descricao).toBe('descrição');
  });

  it('omite descricao quando nao fornecida', () => {
    const result = createQuestSchema.parse({ titulo: 'A', xp: 0 });
    expect(result.descricao).toBeUndefined();
  });

  it('rejeita titulo vazio', () => {
    expect(() => createQuestSchema.parse({ titulo: '', xp: 100 })).toThrow(/obrigat/i);
  });

  it('rejeita titulo maior que 120 chars', () => {
    expect(() => createQuestSchema.parse({ titulo: 'a'.repeat(121), xp: 100 })).toThrow(/120/);
  });

  it('rejeita descricao maior que 500 chars', () => {
    expect(() =>
      createQuestSchema.parse({ titulo: 'A', descricao: 'a'.repeat(501), xp: 100 })
    ).toThrow(/500/);
  });

  it('coerce xp de string para numero', () => {
    const result = createQuestSchema.parse({ titulo: 'A', xp: '500' });
    expect(result.xp).toBe(500);
    expect(typeof result.xp).toBe('number');
  });

  it('rejeita xp negativo', () => {
    expect(() => createQuestSchema.parse({ titulo: 'A', xp: -1 })).toThrow(/negativo/i);
  });

  it('rejeita xp nao-inteiro', () => {
    expect(() => createQuestSchema.parse({ titulo: 'A', xp: 1.5 })).toThrow(/inteiro/i);
  });

  it('rejeita xp ausente', () => {
    expect(() => createQuestSchema.parse({ titulo: 'A' })).toThrow();
  });
});

describe('updateQuestSchema', () => {
  it('aceita update parcial com 1 campo', () => {
    const result = updateQuestSchema.parse({ titulo: 'Novo' });
    expect(result.titulo).toBe('Novo');
  });

  it('aceita update parcial com varios campos', () => {
    const result = updateQuestSchema.parse({ xp: 500, concluida: true });
    expect(result).toEqual({ xp: 500, concluida: true });
  });

  it('aceita descricao como null (limpar)', () => {
    const result = updateQuestSchema.parse({ descricao: null });
    expect(result.descricao).toBeNull();
  });

  it('rejeita body vazio (refine: pelo menos um campo)', () => {
    expect(() => updateQuestSchema.parse({})).toThrow(/pelo menos um/i);
  });

  it('rejeita titulo vazio quando enviado', () => {
    expect(() => updateQuestSchema.parse({ titulo: '' })).toThrow();
  });

  it('rejeita xp negativo quando enviado', () => {
    expect(() => updateQuestSchema.parse({ xp: -5 })).toThrow();
  });
});
