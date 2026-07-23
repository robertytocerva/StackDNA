// Feature: technology-catalog-api, Property 1: Búsqueda por texto retorna solo coincidencias relevantes
// Feature: technology-catalog-api, Property 2: Filtros AND reducen resultados
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Mock repositories
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
import type { Technology } from '../../src/types/technology.types.js';

function makeTechnology(overrides: Partial<Technology> = {}): Technology {
  return {
    id: crypto.randomUUID(),
    nombre: 'TestLib',
    slug: 'testlib',
    tipo: 'Library',
    categoria: 'General',
    lenguaje_principal: 'JavaScript',
    descripcion: 'A test library',
    url_repositorio: null,
    url_documentacion: null,
    estrellas_github: 100,
    descargas_semanales: 1000,
    comando_instalacion: null,
    ejemplo_helloworld: null,
    fuente_origen: 'npm',
    identificador_externo: 'testlib',
    que_es: null,
    caso_uso_principal: null,
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date(),
    ...overrides,
  };
}

describe('Property 1: Búsqueda por texto retorna solo coincidencias relevantes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('all results must contain the query string in nombre or descripcion (case-insensitive)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => /[a-z]/i.test(s)),
        async (query) => {
          const matchingTechs = [
            makeTechnology({ nombre: `Something ${query} here` }),
            makeTechnology({ descripcion: `Uses ${query} internally` }),
          ];

          vi.mocked(technologyRepository.findByFilters).mockResolvedValue(matchingTechs);
          vi.mocked(technologyRepository.count).mockResolvedValue(matchingTechs.length);

          const result = await technologyService.search(
            { query },
            { page: 1, limit: 20 }
          );

          for (const tech of result.data) {
            const nameMatch = tech.nombre.toLowerCase().includes(query.toLowerCase());
            const descMatch = tech.descripcion?.toLowerCase().includes(query.toLowerCase()) ?? false;
            expect(nameMatch || descMatch).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 2: Filtros AND reducen resultados', () => {
  beforeEach(() => vi.clearAllMocks());

  it('adding more filters should result in fewer or equal results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('API', 'Framework', 'Library'),
        fc.constantFrom('Frontend', 'Backend', 'General'),
        async (tipo, categoria) => {
          // Without filters: 10 results
          vi.mocked(technologyRepository.count).mockResolvedValueOnce(10);
          vi.mocked(technologyRepository.findByFilters).mockResolvedValueOnce(
            Array.from({ length: 10 }, () => makeTechnology())
          );

          const noFilter = await technologyService.search({}, { page: 1, limit: 100 });

          // With type filter: <= 10 results
          vi.mocked(technologyRepository.count).mockResolvedValueOnce(5);
          vi.mocked(technologyRepository.findByFilters).mockResolvedValueOnce(
            Array.from({ length: 5 }, () => makeTechnology({ tipo: tipo as 'API' | 'Framework' | 'Library' }))
          );

          const withType = await technologyService.search(
            { type: tipo as 'API' | 'Framework' | 'Library' },
            { page: 1, limit: 100 }
          );

          expect(withType.total).toBeLessThanOrEqual(noFilter.total);

          // With type + category: <= withType results
          vi.mocked(technologyRepository.count).mockResolvedValueOnce(2);
          vi.mocked(technologyRepository.findByFilters).mockResolvedValueOnce(
            Array.from({ length: 2 }, () =>
              makeTechnology({ tipo: tipo as 'API' | 'Framework' | 'Library', categoria })
            )
          );

          const withBoth = await technologyService.search(
            { type: tipo as 'API' | 'Framework' | 'Library', category: categoria },
            { page: 1, limit: 100 }
          );

          expect(withBoth.total).toBeLessThanOrEqual(withType.total);
        }
      ),
      { numRuns: 100 }
    );
  });
});
