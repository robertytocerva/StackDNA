// Feature: technology-catalog-api, Property 5: Validación rechaza entradas inválidas
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { searchQuerySchema } from '../../src/middlewares/validation.middleware.js';

describe('Property 5: Validación rechaza entradas inválidas', () => {
  it('rejects invalid type values', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(
          (s) => !['API', 'Framework', 'Library'].includes(s)
        ),
        (invalidType) => {
          const result = searchQuerySchema.safeParse({ type: invalidType });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects non-positive page values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 0 }),
        (invalidPage) => {
          const result = searchQuerySchema.safeParse({ page: String(invalidPage) });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects query strings longer than 200 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 201, maxLength: 500 }),
        (longQuery) => {
          const result = searchQuerySchema.safeParse({ query: longQuery });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts valid type values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('API', 'Framework', 'Library'),
        (validType) => {
          const result = searchQuerySchema.safeParse({ type: validType });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts valid sort values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('popularity', 'downloads', 'recent'),
        (validSort) => {
          const result = searchQuerySchema.safeParse({ sort: validSort });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects invalid sort values', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(
          (s) => !['popularity', 'downloads', 'recent'].includes(s)
        ),
        (invalidSort) => {
          const result = searchQuerySchema.safeParse({ sort: invalidSort });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('ignores unrecognized parameters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (key, value) => {
          // Avoid collisions with real params
          if (['query', 'type', 'category', 'language', 'sort', 'page', 'limit'].includes(key)) {
            return;
          }
          const result = searchQuerySchema.safeParse({ [key]: value });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
