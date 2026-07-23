const db = require('../../config/database');

const LANGUAGE_KEYWORDS = [
  ['javascript', 'javascript'], ['python', 'python'],
  ['java', 'java'], ['node', 'javascript'],
  ['js', 'javascript'], ['py', 'python'],
];

const CATEGORY_KEYWORDS = {
  pagos: 'pagos', payment: 'pagos',
  auth: 'auth', autenticacion: 'auth', authentication: 'auth',
  http: 'http-client', requests: 'http-client', api: 'http-client',
  testing: 'testing', test: 'testing', pruebas: 'testing',
  ui: 'ui', frontend: 'ui', interfaz: 'ui',
  database: 'database', db: 'database', bd: 'database', basesdedatos: 'database',
  orm: 'orm',
  'web-framework': 'web-framework', 'web framework': 'web-framework', web: 'web-framework',
  middleware: 'middleware',
  cache: 'cache', caching: 'cache',
  logger: 'logging', logging: 'logging', logs: 'logging',
  validation: 'validation', validacion: 'validation',
  email: 'email', mail: 'email', correo: 'email',
  files: 'files', archivos: 'files',
  queue: 'queue', colas: 'queue',
  security: 'security', seguridad: 'security',
  crypto: 'crypto', encryption: 'encryption',
  image: 'image', imagenes: 'image',
  date: 'date', fechas: 'date',
  string: 'strings', text: 'strings',
  json: 'json',
  xml: 'xml',
  csv: 'csv',
  graphql: 'graphql',
  websocket: 'websocket', ws: 'websocket',
  cli: 'cli', terminal: 'cli',
  scheduler: 'scheduler', tareas: 'scheduler',
  monitoring: 'monitoring', monitoreo: 'monitoring',
  config: 'config', configuracion: 'config',
  utility: 'utility', utilidades: 'utility',
};

const TYPE_KEYWORDS = {
  framework: 'framework',
  libreria: 'libreria', library: 'libreria', lib: 'libreria',
  api: 'api',
  herramienta: 'herramienta', tool: 'herramienta',
};

function parseNaturalQuery(query) {
  const lower = query.toLowerCase();
  const result = { text: null, lenguaje: null, categoria: null, tipo: null };

  for (const [keyword, lang] of LANGUAGE_KEYWORDS) {
    if (lower.includes(keyword)) {
      result.lenguaje = lang;
      break;
    }
  }

  for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      result.categoria = cat;
      break;
    }
  }

  for (const [keyword, tipo] of Object.entries(TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      result.tipo = tipo;
      break;
    }
  }

  const cleanQuery = lower
    .replace(/\b(agregar|add|buscar|search|necesito|need|quiero|want|para|for|en|in|de|of|una?|the|con|with)\b/g, '')
    .replace(/\b(java|javascript|js|python|py|node)\b/g, '')
    .trim();

  if (cleanQuery.length > 1) {
    result.text = cleanQuery;
  }

  return result;
}

class CatalogService {
  async search({ query, type, category, lang, page = 1, limit = 20 }) {
    const parsed = parseNaturalQuery(query || '');

    const finalType = type || parsed.tipo;
    const finalCategory = category || parsed.categoria;
    const finalLang = lang || parsed.lenguaje;
    const finalText = parsed.text || query;

    const qb = db('technologies').select('*');
    const countQb = db('technologies').count('* as total');

    if (finalText) {
      const searchExpr = `%${finalText}%`;
      qb.where(function () {
        this.where('nombre', 'ilike', searchExpr)
          .orWhere('descripcion', 'ilike', searchExpr)
          .orWhere('slug', 'ilike', searchExpr)
          .orWhereRaw('exists(select 1 from unnest(tags) t where t ilike ?)', [searchExpr]);
      });
      countQb.where(function () {
        this.where('nombre', 'ilike', searchExpr)
          .orWhere('descripcion', 'ilike', searchExpr)
          .orWhere('slug', 'ilike', searchExpr)
          .orWhereRaw('exists(select 1 from unnest(tags) t where t ilike ?)', [searchExpr]);
      });
    }

    if (finalType) {
      qb.where('tipo', finalType);
      countQb.where('tipo', finalType);
    }

    if (finalCategory) {
      qb.where('categoria', finalCategory);
      countQb.where('categoria', finalCategory);
    }

    if (finalLang) {
      qb.where('lenguaje', finalLang);
      countQb.where('lenguaje', finalLang);
    }

    const offset = (page - 1) * limit;
    qb.orderBy('nombre', 'asc').limit(limit).offset(offset);

    const [items, [{ total }]] = await Promise.all([qb, countQb]);

    return {
      items,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getBySlug(slug) {
    return db('technologies').where('slug', slug).first();
  }

  async getCategories() {
    const rows = await db('technologies')
      .select('categoria')
      .count('* as count')
      .whereNotNull('categoria')
      .groupBy('categoria')
      .orderBy('count', 'desc');
    return rows;
  }

  async getEcosystems() {
    const rows = await db('technologies')
      .select('ecosistema')
      .count('* as count')
      .whereNotNull('ecosistema')
      .groupBy('ecosistema')
      .orderBy('count', 'desc');
    return rows;
  }

  async findOrCreateBySlug(slug, data) {
    const existing = await db('technologies').where({ slug }).first();

    if (existing) {
      const [updated] = await db('technologies')
        .where('id', existing.id)
        .update({ ...data, updated_at: db.fn.now() })
        .returning('*');
      return updated;
    }

    try {
      const [created] = await db('technologies')
        .insert({ ...data, slug })
        .returning('*');
      return created;
    } catch (err) {
      if (err.code === '23505') {
        const existing = await db('technologies').where({ slug }).first();
        if (existing) {
          const [updated] = await db('technologies')
            .where('id', existing.id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*');
          return updated;
        }
      }
      throw err;
    }
  }
}

module.exports = new CatalogService();
