import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dotenv to prevent loading .env file during tests
vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

// We test the validation logic by importing the schema validation function
// and mocking process.env + process.exit

describe('src/config/env.ts - loadAndValidateEnv', () => {
  const originalEnv = { ...process.env };
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset modules so env.ts re-evaluates process.env on import
    vi.resetModules();
    // Clear process.env completely, then add only test values
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    // Restore original env
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
    vi.restoreAllMocks();
  });

  it('should validate successfully with DATABASE_URL and all required vars', async () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

    const { loadAndValidateEnv } = await import('../../../src/config/env.js');
    const result = loadAndValidateEnv();

    expect(result.PORT).toBe(3000);
    expect(result.NODE_ENV).toBe('development');
    expect(result.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/testdb');
  });

  it('should validate successfully with individual DB vars when DATABASE_URL is absent', async () => {
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'production';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'mydb';
    process.env.DB_USER = 'admin';
    process.env.DB_PASSWORD = 'secret';

    const { loadAndValidateEnv } = await import('../../../src/config/env.js');
    const result = loadAndValidateEnv();

    expect(result.PORT).toBe(4000);
    expect(result.NODE_ENV).toBe('production');
    expect(result.DB_HOST).toBe('localhost');
    expect(result.DB_PORT).toBe(5432);
    expect(result.DB_NAME).toBe('mydb');
    expect(result.DB_USER).toBe('admin');
    expect(result.DB_PASSWORD).toBe('secret');
  });

  it('should exit with code 1 when PORT is missing', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

    const { loadAndValidateEnv } = await import('../../../src/config/env.js');

    expect(() => loadAndValidateEnv()).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('should exit with code 1 when NODE_ENV is invalid', async () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'staging';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

    const { loadAndValidateEnv } = await import('../../../src/config/env.js');

    expect(() => loadAndValidateEnv()).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit with code 1 when DATABASE_URL is missing and DB_HOST is missing', async () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'development';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'mydb';
    process.env.DB_USER = 'admin';
    process.env.DB_PASSWORD = 'secret';

    const { loadAndValidateEnv } = await import('../../../src/config/env.js');

    expect(() => loadAndValidateEnv()).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
    const stderrOutput = (stderrSpy.mock.calls[0]?.[0] as string) || '';
    expect(stderrOutput).toContain('DB_HOST');
  });

  it('should apply default cache TTLs when not provided', async () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

    const { loadAndValidateEnv } = await import('../../../src/config/env.js');
    const result = loadAndValidateEnv();

    expect(result.CACHE_TTL_APIS_GURU).toBe(86400);
    expect(result.CACHE_TTL_NPM).toBe(21600);
    expect(result.CACHE_TTL_PYPI).toBe(21600);
    expect(result.CACHE_TTL_GITHUB).toBe(43200);
  });

  it('should use custom cache TTLs when provided', async () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
    process.env.CACHE_TTL_APIS_GURU = '3600';
    process.env.CACHE_TTL_NPM = '1800';
    process.env.CACHE_TTL_PYPI = '7200';
    process.env.CACHE_TTL_GITHUB = '900';

    const { loadAndValidateEnv } = await import('../../../src/config/env.js');
    const result = loadAndValidateEnv();

    expect(result.CACHE_TTL_APIS_GURU).toBe(3600);
    expect(result.CACHE_TTL_NPM).toBe(1800);
    expect(result.CACHE_TTL_PYPI).toBe(7200);
    expect(result.CACHE_TTL_GITHUB).toBe(900);
  });

  it('should treat GITHUB_TOKEN as optional', async () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

    const { loadAndValidateEnv } = await import('../../../src/config/env.js');
    const result = loadAndValidateEnv();

    expect(result.GITHUB_TOKEN).toBeUndefined();
  });

  it('should accept a valid GITHUB_TOKEN', async () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
    process.env.GITHUB_TOKEN = 'ghp_abc123';

    const { loadAndValidateEnv } = await import('../../../src/config/env.js');
    const result = loadAndValidateEnv();

    expect(result.GITHUB_TOKEN).toBe('ghp_abc123');
  });

  it('should list all missing DB variables in error message', async () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'development';

    const { loadAndValidateEnv } = await import('../../../src/config/env.js');

    expect(() => loadAndValidateEnv()).toThrow('process.exit called');
    const stderrOutput = (stderrSpy.mock.calls[0]?.[0] as string) || '';
    expect(stderrOutput).toContain('DB_HOST');
    expect(stderrOutput).toContain('DB_PORT');
    expect(stderrOutput).toContain('DB_NAME');
    expect(stderrOutput).toContain('DB_USER');
    expect(stderrOutput).toContain('DB_PASSWORD');
  });
});
