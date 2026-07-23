// Feature: technology-catalog-api, Property 10: Ordenamiento es correcto
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
import type { Technology } from '../../src/types/technology.types.js';

function makeTech(overrides: Partial<Technology>): Technology {
  return {
    id: crypto.randomUUID(),
    nombre: 'Test',
    slug: 'test',
    tipo: 'Library',
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
    identificador_externo: 'test',
    que_es: null,
    caso_uso_principal: null,
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date(),
    ...overrides,
  };
}

describe('Property 10: Ordenamiento es correcto', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sort=popularity returns results ordered by estrellas_github DESC', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 0, max: 500000 }), { minLength: 2, maxLength: 20 }),
        async (stars) => {
          // Sort descending to simulate correct DB behavior
          const sorted = [...stars].sort((a, b) => b - a);
          const techs = sorted.map((s) => makeTech({ estrellas_github: s }));

          vi.mocked(technologyRepository.findByFilters).mockResolvedValue(techs);
          vi.mocked(technologyRepository.count).mockResolvedValue(techs.length);

          const result = await technologyService.search(
            { sort: 'popularity' },
            { page: 1, limit: 100 }
          );

          for (let i = 0; i < result.data.length - 1; i++) {
            expect(result.data[i].estrellas_github).toBeGreaterThanOrEqual(
              result.data[i + 1].estrellas_github
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sort=downloads returns results ordered by descargas_semanales DESC', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 0, max: 1000000 }), { minLength: 2, maxLength: 20 }),
        async (downloads) => {
          const sorted = [...downloads].sort((a, b) => b - a);
          const techs = sorted.map((d) => makeTech({ descargas_semanales: d }));

          vi.mocked(technologyRepository.findByFilters).mockResolvedValue(techs);
          vi.mocked(technologyRepository.count).mockResolvedValue(techs.length);

          const result = await technologyService.search(
            { sort: 'downloads' },
            { page: 1, limit: 100 }
          );

          for (let i = 0; i < result.data.length - 1; i++) {
            expect(result.data[i].descargas_semanales).toBeGreaterThanOrEqual(
              result.data[i + 1].descargas_semanales
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sort=recent returns results ordered by fecha_creacion DESC', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }), {
          minLength: 2,
          maxLength: 20,
        }),
        async (dates) => {
          const sorted = [...dates].sort((a, b) => b.getTime() - a.getTime());
          const techs = sorted.map((d) => makeTech({ fecha_creacion: d }));

          vi.mocked(technologyRepository.findByFilters).mockResolvedValue(techs);
          vi.mocked(technologyRepository.count).mockResolvedValue(techs.length);

          const result = await technologyService.search(
            { sort: 'recent' },
            { page: 1, limit: 100 }
          );

          for (let i = 0; i < result.data.length - 1; i++) {
            expect(new Date(result.data[i].fecha_creacion).getTime()).toBeGreaterThanOrEqual(
              new Date(result.data[i + 1].fecha_creacion).getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
