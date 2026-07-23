const axios = require('axios');
const db = require('../config/database');
const catalogService = require('../modules/catalog/catalog.service');
const { getLogoUrl } = require('./logoService');

const PYPI_API = 'https://pypi.org/pypi';

const POPULAR_PACKAGES = [
  'django', 'flask', 'fastapi', 'starlette', 'tornado', 'bottle',
  'requests', 'httpx', 'aiohttp', 'urllib3',
  'numpy', 'pandas', 'scipy', 'scikit-learn', 'matplotlib',
  'pydantic', 'marshmallow', 'cerberus',
  'sqlalchemy', 'peewee', 'tortoise-orm', 'databases',
  'celery', 'rq', 'huey',
  'pytest', 'unittest', 'nose2', 'tox',
  'black', 'flake8', 'isort', 'mypy', 'ruff',
  'uvicorn', 'gunicorn', 'hypercorn',
  'poetry', 'pipenv', 'setuptools', 'wheel',
  'tensorflow', 'torch', 'keras',
  'pillow', 'opencv-python',
  'beautifulsoup4', 'scrapy', 'selenium',
  'click', 'typer', 'argparse',
  'rich', 'colorama', 'tabulate',
  'python-dotenv', 'python-decouple',
  'python-jose', 'passlib', 'bcrypt',
  'celery', 'redis', 'kombu',
  'alembic', 'migrations',
  'python-multipart', 'formtools',
  'websockets', 'socketio',
  'pymongo', 'redis-py', 'psycopg2', 'asyncpg',
  'paramiko', 'fabric',
  'pyyaml', 'toml', 'hjson',
  'schedule', 'apscheduler',
  'python-dateutil', 'arrow', 'pendulum',
  'jinja2', 'mako',
  'chardet', 'charset-normalizer',
  'cryptography', 'pycryptodome',
  'loguru', 'structlog',
  'tenacity', 'backoff',
  'pydantic-settings', 'dynaconf',
  'fastapi-users', 'authlib',
  'strawberry-graphql', 'ariadne',
  'sqlmodel', 'ormar',
  'pydantic', 'email-validator',
];

const SEARCH_TERMS = [
  'web+framework', 'testing', 'http+client', 'database', 'orm',
  'authentication', 'validation', 'logging', 'cli', 'scheduler',
  'email', 'file+upload', 'websocket', 'graphql', 'cache',
  'image+processing', 'pdf', 'csv', 'excel', 'data+science',
  'machine+learning', 'deep+learning', 'scraping', 'automation',
  'payment', 'twilio', 'sendgrid', 'async',
];

async function syncPypi() {
  const log = { fuente: 'pypi', status: 'success', items_synced: 0, error_message: null };

  try {
    for (const pkg of POPULAR_PACKAGES) {
      try {
        const { data } = await axios.get(`${PYPI_API}/${pkg}/json`, { timeout: 5000 });
        const info = data.info;
        const keywords = (info.keywords || '').split(/[,\s]+/).filter(Boolean);

        await catalogService.findOrCreateBySlug(pkg, {
          nombre: pkg,
          tipo: detectType(info, keywords),
          lenguaje: 'python',
          ecosistema: 'pypi',
          categoria: categorizePython(pkg, info.summary || ''),
          descripcion: info.summary || '',
          logo_url: getLogoUrl(pkg),
          repo_url: info.project_urls?.Source || info.project_urls?.Repository || null,
          docs_url: info.project_urls?.Documentation || null,
          homepage_url: info.project_url || null,
          version: info.version || null,
          stats: JSON.stringify({
            version: info.version,
            requires_python: info.requires_python,
            license: info.license || null,
          }),
          tags: keywords.slice(0, 15),
          key_features: [],
          use_cases: [],
          installation: `pip install ${pkg}`,
        });

        log.items_synced++;
        await sleep(100);
      } catch (e) {
        // skip not found packages
      }
    }
  } catch (err) {
    log.status = 'error';
    log.error_message = err.message;
  } finally {
    await db('sync_logs').insert(log);
  }

  return log;
}

function detectType(info, keywords) {
  const kw = keywords.map(k => k.toLowerCase());
  const desc = (info.summary || '').toLowerCase();
  if (kw.includes('framework') || desc.includes('framework')) return 'framework';
  if (kw.includes('cli') || kw.includes('tool') || kw.includes('command-line')) return 'herramienta';
  return 'libreria';
}

function categorizePython(name, desc) {
  const lower = name.toLowerCase() + ' ' + desc.toLowerCase();
  if (lower.includes('web') || lower.includes('django') || lower.includes('flask') || lower.includes('fastapi')) return 'web-framework';
  if (lower.includes('test') || lower.includes('pytest') || lower.includes('unittest')) return 'testing';
  if (lower.includes('http') || lower.includes('requests') || lower.includes('httpx') || lower.includes('aiohttp')) return 'http-client';
  if (lower.includes('database') || lower.includes('orm') || lower.includes('sqlalchemy') || lower.includes('sql')) return 'database';
  if (lower.includes('auth') || lower.includes('jwt') || lower.includes('passlib') || lower.includes('bcrypt')) return 'auth';
  if (lower.includes('log') || lower.includes('logging') || lower.includes('loguru')) return 'logging';
  if (lower.includes('validate') || lower.includes('validation') || lower.includes('pydantic')) return 'validation';
  if (lower.includes('cache') || lower.includes('redis')) return 'cache';
  if (lower.includes('queue') || lower.includes('celery') || lower.includes('rq')) return 'queue';
  if (lower.includes('email') || lower.includes('mail')) return 'email';
  if (lower.includes('cli') || lower.includes('click') || lower.includes('typer')) return 'cli';
  if (lower.includes('scheduler') || lower.includes('cron') || lower.includes('apscheduler')) return 'scheduler';
  if (lower.includes('websocket') || lower.includes('socket')) return 'websocket';
  if (lower.includes('graphql')) return 'graphql';
  if (lower.includes('image') || lower.includes('pillow') || lower.includes('opencv')) return 'image';
  if (lower.includes('pdf')) return 'pdf';
  if (lower.includes('csv') || lower.includes('excel')) return 'csv';
  if (lower.includes('scraping') || lower.includes('beautifulsoup') || lower.includes('selenium')) return 'scraping';
  if (lower.includes('data') || lower.includes('numpy') || lower.includes('pandas')) return 'data-science';
  if (lower.includes('machine') || lower.includes('tensorflow') || lower.includes('torch')) return 'ml';
  if (lower.includes('async')) return 'async';
  if (lower.includes('file') || lower.includes('upload')) return 'files';
  if (lower.includes('security') || lower.includes('crypto')) return 'security';
  return 'utility';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { syncPypi };
