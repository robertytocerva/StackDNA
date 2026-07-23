// Feature: technology-catalog-api, Property 6: Caché hit evita petición externa
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Mock the cache repository
vi.mock('../../src/repositories/cache.repository.js', () => ({
  findByKey: vi.fn(),
  upsert: vi.fn(),
  deleteExpired: vi.fn(),
  countExpired: vi.fn(),
}));

// Mock the config
vi.mock('../../src/config/index.js', () => ({
  config: {
    cacheTtl: {
      apisGuru: 86400,
      npm: 21600,
      pypi: 21600,
      github: 43200,
    },
  },
}));

import * as cacheService from '../../src/services/cache.service.js';
import * as cacheRepository from '../../src/repositories/cache.repository.js';

describe('Property 6: Caché hit evita petición externa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('when cache entry exists and is not expired, fetchFn is never called', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.string({ minLength: 1, maxLength: 20 })),
        async (key, fuente, data) => {
          vi.clearAllMocks();
          const futureDate = new Date(Date.now() + 3600 * 1000); // 1 hour from now
          vi.mocked(cacheRepository.findByKey).mockResolvedValue({
            id: 1,
            cache_key: `${fuente}:${key}`,
            fuente,
            response_body: data,
            expires_at: futureDate,
            created_at: new Date(),
            updated_at: new Date(),
          });

          const fetchFn = vi.fn().mockResolvedValue({ fresh: true });
          const result = await cacheService.getOrFetch(key, fuente, fetchFn);

          expect(fetchFn).not.toHaveBeenCalled();
          expect(result).toEqual(data);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when cache entry is expired, fetchFn is called', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.jsonValue(),
        async (key, fuente, data) => {
          const pastDate = new Date(Date.now() - 3600 * 1000); // 1 hour ago
          vi.mocked(cacheRepository.findByKey).mockResolvedValue({
            id: 1,
            cache_key: `${fuente}:${key}`,
            fuente,
            response_body: data,
            expires_at: pastDate,
            created_at: new Date(),
            updated_at: new Date(),
          });
          vi.mocked(cacheRepository.upsert).mockResolvedValue();

          const freshData = { fresh: true, key };
          const fetchFn = vi.fn().mockResolvedValue(freshData);
          const result = await cacheService.getOrFetch(key, fuente, fetchFn);

          expect(fetchFn).toHaveBeenCalledOnce();
          expect(result).toEqual(freshData);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when cache is empty, fetchFn is called', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (key, fuente) => {
          vi.mocked(cacheRepository.findByKey).mockResolvedValue(null);
          vi.mocked(cacheRepository.upsert).mockResolvedValue();

          const freshData = { fetched: true };
          const fetchFn = vi.fn().mockResolvedValue(freshData);
          const result = await cacheService.getOrFetch(key, fuente, fetchFn);

          expect(fetchFn).toHaveBeenCalledOnce();
          expect(result).toEqual(freshData);
        }
      ),
      { numRuns: 100 }
    );
  });
});
