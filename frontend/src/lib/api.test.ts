import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { questsApi } from '@/lib/api';

const mockFetch = vi.fn();

describe('questsApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Content-Type handling', () => {
    it('POST com body envia Content-Type application/json', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'q-1' }), { status: 201, headers: { 'Content-Type': 'application/json' } })
      );

      await questsApi.create({ titulo: 'x', descricao: '', xp: 0 });

      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers['Content-Type']).toBe('application/json');
    });

    it('PATCH com body envia Content-Type application/json', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'q-1' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      );

      await questsApi.update('q-1', { concluida: true });

      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers['Content-Type']).toBe('application/json');
    });

    it('DELETE sem body NAO envia Content-Type application/json', async () => {
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));

      await questsApi.delete('q-1');

      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers['Content-Type']).toBeUndefined();
    });
  });

  describe('ApiError', () => {
    it('lanca ApiError com status e message do body', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'recurso nao encontrado' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(questsApi.findById('x')).rejects.toMatchObject({
        name: 'ApiError',
        status: 404,
        message: 'recurso nao encontrado',
      });
    });

    it('retorna undefined em resposta 204', async () => {
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));

      await expect(questsApi.delete('q-1')).resolves.toBeUndefined();
    });
  });
});
