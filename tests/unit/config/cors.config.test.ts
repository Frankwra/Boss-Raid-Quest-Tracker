import { describe, it, expect } from 'vitest';
import { buildCorsOptions } from '../../../src/config/cors.js';

describe('buildCorsOptions', () => {
  it('usa a FRONTEND_URL configurada como origin', () => {
    const opts = buildCorsOptions('http://localhost:3000');
    expect(opts.origin).toBe('http://localhost:3000');
  });

  it('habilita credentials', () => {
    const opts = buildCorsOptions('http://localhost:3000');
    expect(opts.credentials).toBe(true);
  });

  it('permite os metodos usados pela API (GET, POST, PATCH, DELETE)', () => {
    const opts = buildCorsOptions('http://localhost:3000');
    expect(opts.methods).toEqual(expect.arrayContaining(['GET', 'POST', 'PATCH', 'DELETE']));
  });
});
