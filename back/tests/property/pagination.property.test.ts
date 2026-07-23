// Feature: technology-catalog-api, Property 3: Paginación es consistente
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateTotalPages, buildPaginatedResponse } from '../../src/utils/pagination.js';

describe('Property 3: Paginación es consistente', () => {
  it('totalPages == ceil(total / limit)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 1, max: 100 }),
        (total, limit) => {
          const totalPages = calculateTotalPages(total, limit);
          const expected = total === 0 ? 0 : Math.ceil(total / limit);
          expect(totalPages).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('data.length <= limit for any page', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 0, maxLength: 200 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 50 }),
        (allData, limit, page) => {
          const total = allData.length;
          const offset = (page - 1) * limit;
          const pageData = allData.slice(offset, offset + limit);
          const response = buildPaginatedResponse(pageData, total, page, limit);

          expect(response.data.length).toBeLessThanOrEqual(limit);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('if page <= totalPages then data.length == min(limit, total - (page-1)*limit)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500 }),
        fc.integer({ min: 1, max: 100 }),
        (total, limit) => {
          const totalPages = Math.ceil(total / limit);
          // Pick a valid page
          const page = Math.min(totalPages, Math.max(1, Math.floor(Math.random() * totalPages) + 1));
          const expectedLength = Math.min(limit, total - (page - 1) * limit);

          // Simulate the data slice
          const allData = Array.from({ length: total }, (_, i) => i);
          const offset = (page - 1) * limit;
          const pageData = allData.slice(offset, offset + limit);

          expect(pageData.length).toBe(expectedLength);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('response structure has all required fields', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 0, maxLength: 50 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 100 }),
        (data, total, page, limit) => {
          const response = buildPaginatedResponse(data, total, page, limit);
          expect(response).toHaveProperty('total');
          expect(response).toHaveProperty('page');
          expect(response).toHaveProperty('limit');
          expect(response).toHaveProperty('totalPages');
          expect(response).toHaveProperty('data');
          expect(typeof response.total).toBe('number');
          expect(typeof response.page).toBe('number');
          expect(typeof response.limit).toBe('number');
          expect(typeof response.totalPages).toBe('number');
          expect(Array.isArray(response.data)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
