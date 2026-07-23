// Feature: technology-catalog-api, Property 9: Limit se acota a 100
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

vi.mock('../../src/repositories/technology.repository.js', () => ({
  findByFilters: vi.fn(),
  count: vi.fn(),
}));

vi.mock('../../src/config/index.js', () => ({
  config: { cacheTtl: { apisGuru: 86400, npm: 21600, pypi: 21600, github: 43200 } },
  pool: { query: vi.fn() },
}));

import * as technologyService from '../../src/services/technology.service.js';
import * as technologyRepository from '../../src/repositories/technology.repository.js';

describe('Property 9: Limit se acota a 100', () => {
  beforeEach(() => vi.clearAllMocks());

  it('for any limit > 100, response limit field is 100 and data length <= 100', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 101, max: 10000 }),
        async (requestedLimit) => {
          const mockData = Array.from({ length: 100 }, (_, i) => ({
            id: crypto.randomUUID(),
            nombre: `Tech ${i}`,
            slug: `tech-${i}`,
            tipo: 'Library' as const,
            categoria: null,
            lenguaje_principal: null,
            descripcion: null,
            url_repositorio: null,
            url_documentacion: null,
            estrellas_github: 0,
            descargas_semanales: 0,
            comando_instalacion: null,
            ejemplo_helloworld: null,
            fuente_origen: 'npm',
            identificador_externo: `tech-${i}`,
            que_es: null,
            caso_uso_principal: null,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
          }));

          vi.mocked(technologyRepository.findByFilters).mockResolvedValue(mockData);
          vi.mocked(technologyRepository.count).mockResolvedValue(500);

          const result = await technologyService.search({}, { page: 1, limit: requestedLimit });

          expect(result.limit).toBe(100);
          expect(result.data.length).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any limit <= 100, the limit is preserved', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        async (requestedLimit) => {
          vi.mocked(technologyRepository.findByFilters).mockResolvedValue([]);
          vi.mocked(technologyRepository.count).mockResolvedValue(0);

          const result = await technologyService.search({}, { page: 1, limit: requestedLimit });

          expect(result.limit).toBe(requestedLimit);
        }
      ),
      { numRuns: 100 }
    );
  });
});
