import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

const originalEnv = { ...process.env };

const baseValidEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  POSTGRES_USER: 'user',
  POSTGRES_PASSWORD: 'pass',
  POSTGRES_DB: 'db',
  POSTGRES_PORT: '5432',
  PORT: '3333',
  NODE_ENV: 'development',
};

async function loadEnv(env: NodeJS.ProcessEnv, excludeFromOriginal: string[] = []) {
  vi.resetModules();
  for (const key of Object.keys(process.env)) {
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(originalEnv)) {
    if (!excludeFromOriginal.includes(key)) {
      process.env[key] = value;
    }
  }
  Object.assign(process.env, env);
  return import('../../../src/config/env.js');
}

describe('env schema', () => {
  afterAll(() => {
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  it('deve aceitar env válido', async () => {
    const { env } = await loadEnv(baseValidEnv);
    expect(env.DATABASE_URL).toBe(baseValidEnv.DATABASE_URL);
    expect(env.POSTGRES_USER).toBe('user');
    expect(env.POSTGRES_PASSWORD).toBe('pass');
    expect(env.POSTGRES_DB).toBe('db');
    expect(env.POSTGRES_PORT).toBe('5432');
    expect(env.PORT).toBe('3333');
    expect(env.NODE_ENV).toBe('development');
  });

  it('deve aplicar defaults para PORT, POSTGRES_PORT e NODE_ENV', async () => {
    const { env } = await loadEnv(
      {
        DATABASE_URL: baseValidEnv.DATABASE_URL,
        POSTGRES_USER: baseValidEnv.POSTGRES_USER,
        POSTGRES_PASSWORD: baseValidEnv.POSTGRES_PASSWORD,
        POSTGRES_DB: baseValidEnv.POSTGRES_DB,
      },
      ['PORT', 'POSTGRES_PORT', 'NODE_ENV']
    );
    expect(env.PORT).toBe('3333');
    expect(env.POSTGRES_PORT).toBe('5432');
    expect(env.NODE_ENV).toBe('development');
  });

  it('deve falhar se DATABASE_URL ausente', async () => {
    await expect(
      loadEnv({
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
      })
    ).rejects.toThrow();
  });

  it('deve falhar se DATABASE_URL não é URL', async () => {
    await expect(
      loadEnv({ ...baseValidEnv, DATABASE_URL: 'not-a-url' })
    ).rejects.toThrow(/URL válida/);
  });

  it('deve falhar se DATABASE_URL não começa com postgresql://', async () => {
    await expect(
      loadEnv({ ...baseValidEnv, DATABASE_URL: 'mysql://user:pass@localhost:3306/db' })
    ).rejects.toThrow(/postgresql:\/\//);
  });

  it('deve falhar se POSTGRES_USER ausente', async () => {
    await expect(
      loadEnv({
        DATABASE_URL: baseValidEnv.DATABASE_URL,
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
      })
    ).rejects.toThrow();
  });

  it('deve falhar se POSTGRES_PORT não é numérico', async () => {
    await expect(
      loadEnv({ ...baseValidEnv, POSTGRES_PORT: 'abc' })
    ).rejects.toThrow(/numérico/);
  });

  it('deve falhar se NODE_ENV é inválido', async () => {
    await expect(
      loadEnv({ ...baseValidEnv, NODE_ENV: 'staging' })
    ).rejects.toThrow();
  });
});
