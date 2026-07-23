import { pool } from '../config/index.js';
import type { Technology, TechnologyFilters, PaginationParams, CreateTechnologyDTO } from '../types/technology.types.js';
import { calculateOffset } from '../utils/pagination.js';

/**
 * Builds a dynamic WHERE clause and parameters array from filters.
 */
function buildWhereClause(filters: TechnologyFilters): { clause: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.query) {
    conditions.push(`(lower(nombre) LIKE $${paramIndex} OR lower(descripcion) LIKE $${paramIndex})`);
    params.push(`%${filters.query.toLowerCase()}%`);
    paramIndex++;
  }

  if (filters.type) {
    conditions.push(`tipo = $${paramIndex}`);
    params.push(filters.type);
    paramIndex++;
  }

  if (filters.category) {
    conditions.push(`lower(categoria) = $${paramIndex}`);
    params.push(filters.category.toLowerCase());
    paramIndex++;
  }

  if (filters.language) {
    conditions.push(`lower(lenguaje_principal) = $${paramIndex}`);
    params.push(filters.language.toLowerCase());
    paramIndex++;
  }

  const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { clause, params };
}

/**
 * Maps sort parameter to SQL ORDER BY clause.
 */
function buildOrderClause(sort?: string): string {
  switch (sort) {
    case 'popularity':
      return 'ORDER BY estrellas_github DESC';
    case 'downloads':
      return 'ORDER BY descargas_semanales DESC';
    case 'recent':
    default:
      return 'ORDER BY fecha_creacion DESC';
  }
}

export async function findByFilters(
  filters: TechnologyFilters,
  pagination: PaginationParams
): Promise<Technology[]> {
  const { clause, params } = buildWhereClause(filters);
  const orderClause = buildOrderClause(filters.sort);
  const offset = calculateOffset(pagination.page, pagination.limit);

  const paramIndex = params.length + 1;
  const query = `
    SELECT * FROM technologies
    ${clause}
    ${orderClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const result = await pool.query<Technology>(query, [...params, pagination.limit, offset]);
  return result.rows;
}

export async function count(filters: TechnologyFilters): Promise<number> {
  const { clause, params } = buildWhereClause(filters);
  const query = `SELECT COUNT(*)::int as total FROM technologies ${clause}`;
  const result = await pool.query<{ total: number }>(query, params);
  return result.rows[0].total;
}

export async function findByIdOrSlug(idOrSlug: string): Promise<Technology | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  const query = isUuid
    ? `SELECT * FROM technologies WHERE id = $1`
    : `SELECT * FROM technologies WHERE slug = $1`;

  const result = await pool.query<Technology>(query, [idOrSlug]);
  return result.rows[0] ?? null;
}

export async function insert(technology: CreateTechnologyDTO): Promise<Technology> {
  const result = await pool.query<Technology>(
    `INSERT INTO technologies (
      nombre, slug, tipo, categoria, lenguaje_principal, descripcion,
      url_repositorio, url_documentacion, estrellas_github, descargas_semanales,
      comando_instalacion, ejemplo_helloworld, fuente_origen, identificador_externo,
      que_es, caso_uso_principal
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      technology.nombre,
      technology.slug,
      technology.tipo,
      technology.categoria ?? null,
      technology.lenguaje_principal ?? null,
      technology.descripcion ?? null,
      technology.url_repositorio ?? null,
      technology.url_documentacion ?? null,
      technology.estrellas_github ?? 0,
      technology.descargas_semanales ?? 0,
      technology.comando_instalacion ?? null,
      technology.ejemplo_helloworld ?? null,
      technology.fuente_origen,
      technology.identificador_externo,
      technology.que_es ?? null,
      technology.caso_uso_principal ?? null,
    ]
  );
  return result.rows[0];
}

export async function upsertBySource(technology: CreateTechnologyDTO): Promise<Technology> {
  const result = await pool.query<Technology>(
    `INSERT INTO technologies (
      nombre, slug, tipo, categoria, lenguaje_principal, descripcion,
      url_repositorio, url_documentacion, estrellas_github, descargas_semanales,
      comando_instalacion, ejemplo_helloworld, fuente_origen, identificador_externo,
      que_es, caso_uso_principal
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT (fuente_origen, identificador_externo) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      tipo = EXCLUDED.tipo,
      categoria = EXCLUDED.categoria,
      lenguaje_principal = EXCLUDED.lenguaje_principal,
      descripcion = EXCLUDED.descripcion,
      url_repositorio = EXCLUDED.url_repositorio,
      url_documentacion = EXCLUDED.url_documentacion,
      estrellas_github = EXCLUDED.estrellas_github,
      descargas_semanales = EXCLUDED.descargas_semanales,
      comando_instalacion = EXCLUDED.comando_instalacion,
      ejemplo_helloworld = EXCLUDED.ejemplo_helloworld,
      que_es = EXCLUDED.que_es,
      caso_uso_principal = EXCLUDED.caso_uso_principal,
      fecha_actualizacion = NOW()
    RETURNING *`,
    [
      technology.nombre,
      technology.slug,
      technology.tipo,
      technology.categoria ?? null,
      technology.lenguaje_principal ?? null,
      technology.descripcion ?? null,
      technology.url_repositorio ?? null,
      technology.url_documentacion ?? null,
      technology.estrellas_github ?? 0,
      technology.descargas_semanales ?? 0,
      technology.comando_instalacion ?? null,
      technology.ejemplo_helloworld ?? null,
      technology.fuente_origen,
      technology.identificador_externo,
      technology.que_es ?? null,
      technology.caso_uso_principal ?? null,
    ]
  );
  return result.rows[0];
}

export async function findSlugsByBase(baseSlug: string): Promise<string[]> {
  const result = await pool.query<{ slug: string }>(
    `SELECT slug FROM technologies WHERE slug = $1 OR slug LIKE $2`,
    [baseSlug, `${baseSlug}-%`]
  );
  return result.rows.map((r) => r.slug);
}
