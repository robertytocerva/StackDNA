import type { ExternalTechnology } from '../types/technology.types.js';
import type { ExternalConnector } from '../types/connector.types.js';
import * as technologyRepository from '../repositories/technology.repository.js';
import { generateSlug, resolveSlugCollision } from '../utils/slug.js';
import { pool } from '../config/index.js';
import { logger } from '../utils/logger.js';

interface SeedingSummary {
  processed: number;
  inserted: number;
  updated: number;
  errors: number;
  bySource: Record<string, { processed: number; inserted: number; updated: number; errors: number }>;
}

const BATCH_SIZE = 50;
const SOURCE_TIMEOUT_MS = 30000;

/**
 * Runs the full seeding process using all provided connectors.
 */
export async function runSeeding(connectors: ExternalConnector[]): Promise<SeedingSummary> {
  const summary: SeedingSummary = {
    processed: 0,
    inserted: 0,
    updated: 0,
    errors: 0,
    bySource: {},
  };

  for (const connector of connectors) {
    const sourceSummary = { processed: 0, inserted: 0, updated: 0, errors: 0 };

    try {
      const technologies = await fetchWithTimeout(connector, SOURCE_TIMEOUT_MS);
      logger.info(`Fetched ${technologies.length} technologies from ${connector.source}`);

      // Process in batches
      for (let i = 0; i < technologies.length; i += BATCH_SIZE) {
        const batch = technologies.slice(i, i + BATCH_SIZE);
        const batchResult = await processBatch(batch, connector.source);

        sourceSummary.processed += batchResult.processed;
        sourceSummary.inserted += batchResult.inserted;
        sourceSummary.updated += batchResult.updated;
        sourceSummary.errors += batchResult.errors;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`Source ${connector.source} failed: ${msg}`);
      sourceSummary.errors++;
    }

    summary.bySource[connector.source] = sourceSummary;
    summary.processed += sourceSummary.processed;
    summary.inserted += sourceSummary.inserted;
    summary.updated += sourceSummary.updated;
    summary.errors += sourceSummary.errors;
  }

  return summary;
}

async function fetchWithTimeout(
  connector: ExternalConnector,
  timeoutMs: number
): Promise<ExternalTechnology[]> {
  return new Promise<ExternalTechnology[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout fetching from ${connector.source} after ${timeoutMs}ms`));
    }, timeoutMs);

    connector
      .fetchList({ offset: 0, limit: 50 })
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function processBatch(
  technologies: ExternalTechnology[],
  source: string
): Promise<{ processed: number; inserted: number; updated: number; errors: number }> {
  const result = { processed: 0, inserted: 0, updated: 0, errors: 0 };
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const tech of technologies) {
      result.processed++;

      // Validate required fields
      if (!tech.nombre || !tech.identificador_externo || !tech.fuente_origen) {
        result.errors++;
        continue;
      }

      try {
        const baseSlug = generateSlug(tech.nombre);
        const existingSlugs = await technologyRepository.findSlugsByBase(baseSlug);
        const slug = resolveSlugCollision(baseSlug, existingSlugs);

        const upserted = await technologyRepository.upsertBySource({
          nombre: tech.nombre,
          slug,
          tipo: tech.tipo,
          categoria: tech.categoria ?? null,
          lenguaje_principal: tech.lenguaje_principal ?? null,
          descripcion: tech.descripcion ?? null,
          url_repositorio: tech.url_repositorio ?? null,
          url_documentacion: tech.url_documentacion ?? null,
          estrellas_github: tech.estrellas_github ?? 0,
          descargas_semanales: tech.descargas_semanales ?? 0,
          comando_instalacion: tech.comando_instalacion ?? null,
          ejemplo_helloworld: tech.ejemplo_helloworld ?? null,
          fuente_origen: tech.fuente_origen,
          identificador_externo: tech.identificador_externo,
          que_es: tech.que_es ?? null,
          caso_uso_principal: tech.caso_uso_principal ?? null,
        });

        // If fecha_creacion ~ fecha_actualizacion, it's an insert
        const created = upserted.fecha_creacion.getTime();
        const updated = upserted.fecha_actualizacion.getTime();
        if (Math.abs(created - updated) < 1000) {
          result.inserted++;
        } else {
          result.updated++;
        }
      } catch (error) {
        result.errors++;
        logger.warn(`Error processing ${tech.nombre} from ${source}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    result.errors += technologies.length - result.processed;
    logger.error(`Batch rollback for ${source}`, {
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    client.release();
  }

  return result;
}
