import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type pg from 'pg';

describe('database config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create a pool with DATABASE_URL when provided', async () => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

    // Mock pg module
    const mockPool = { query: vi.fn() };
    vi.doMock('pg', () => ({
      default: { Pool: vi.fn(() => mockPool) },
    }));

    const { pool } = await import('../../../src/config/database.js');
    expect(pool).toBe(mockPool);

    const pgModule = await import('pg');
    const Pool = pgModule.default.Pool as unknown as ReturnType<typeof vi.fn>;
    expect(Pool).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        min: 2,
        max: 10,
        connectionTimeoutMillis: 30000,
      }),
    );
  });

  it('should create a pool with individual variables when DATABASE_URL is absent', async () => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    delete process.env.DATABASE_URL;
    process.env.DB_HOST = 'myhost';
    process.env.DB_PORT = '5433';
    process.env.DB_NAME = 'mydb';
    process.env.DB_USER = 'myuser';
    process.env.DB_PASSWORD = 'mypass';

    const mockPool = { query: vi.fn() };
    vi.doMock('pg', () => ({
      default: { Pool: vi.fn(() => mockPool) },
    }));

    const { pool } = await import('../../../src/config/database.js');
    expect(pool).toBe(mockPool);

    const pgModule = await import('pg');
    const Pool = pgModule.default.Pool as unknown as ReturnType<typeof vi.fn>;
    expect(Pool).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'myhost',
        port: 5433,
        database: 'mydb',
        user: 'myuser',
        password: 'mypass',
        min: 2,
        max: 10,
        connectionTimeoutMillis: 30000,
      }),
    );
  });

  it('should export pool as a singleton', async () => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

    const mockPool = { query: vi.fn() };
    vi.doMock('pg', () => ({
      default: { Pool: vi.fn(() => mockPool) },
    }));

    const module1 = await import('../../../src/config/database.js');
    const module2 = await import('../../../src/config/database.js');
    expect(module1.pool).toBe(module2.pool);
  });

  it('should configure pool with min 2, max 10, connectionTimeoutMillis 30000', async () => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

    const mockPool = { query: vi.fn() };
    const MockPool = vi.fn(() => mockPool);
    vi.doMock('pg', () => ({
      default: { Pool: MockPool },
    }));

    await import('../../../src/config/database.js');
    const callArgs = MockPool.mock.calls[0][0] as pg.PoolConfig;
    expect(callArgs.min).toBe(2);
    expect(callArgs.max).toBe(10);
    expect(callArgs.connectionTimeoutMillis).toBe(30000);
  });
});
