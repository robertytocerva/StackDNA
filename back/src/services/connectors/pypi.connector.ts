import type { ExternalConnector } from '../../types/connector.types.js';
import type { ExternalTechnology } from '../../types/technology.types.js';
import { createConnectorClient } from './connector.interface.js';
import * as cacheService from '../cache.service.js';

const { client, limiter } = createConnectorClient({
  baseUrl: 'https://pypi.org',
});

interface PyPIPackageDetail {
  info: {
    name: string;
    summary?: string;
    description?: string;
    home_page?: string;
    project_urls?: Record<string, string>;
    classifiers?: string[];
    requires_python?: string;
    keywords?: string;
    package_url?: string;
  };
}

// Popular Python packages to seed from
const POPULAR_PACKAGES = [
  'django', 'flask', 'fastapi', 'requests', 'numpy', 'pandas',
  'scipy', 'matplotlib', 'tensorflow', 'pytorch', 'scikit-learn',
  'sqlalchemy', 'celery', 'redis', 'boto3', 'pillow',
  'pytest', 'black', 'mypy', 'pydantic', 'httpx',
  'aiohttp', 'uvicorn', 'gunicorn', 'beautifulsoup4', 'scrapy',
];

export const pypiConnector: ExternalConnector = {
  source: 'pypi',

  async fetchList(params: { offset: number; limit: number }): Promise<ExternalTechnology[]> {
    const packages = POPULAR_PACKAGES.slice(params.offset, params.offset + params.limit);
    const results: ExternalTechnology[] = [];

    for (const pkg of packages) {
      const detail = await this.fetchDetail(pkg);
      if (detail) {
        results.push(detail);
      }
    }

    return results;
  },

  async fetchDetail(identifier: string): Promise<ExternalTechnology | null> {
    const data = await cacheService.getOrFetch<PyPIPackageDetail>(
      `pkg:${identifier}`,
      'pypi',
      async () => {
        const response = await limiter.schedule(() =>
          client.get<PyPIPackageDetail>(`/pypi/${encodeURIComponent(identifier)}/json`)
        );
        return response.data;
      }
    );

    if (!data?.info?.name) return null;

    const info = data.info;
    const repoUrl =
      info.project_urls?.['Source'] ??
      info.project_urls?.['Repository'] ??
      info.project_urls?.['GitHub'] ??
      info.project_urls?.['Code'];

    const docsUrl =
      info.project_urls?.['Documentation'] ??
      info.project_urls?.['Docs'] ??
      info.home_page;

    const tipo = inferPyPIType(info.classifiers);

    return {
      nombre: info.name,
      descripcion: info.summary?.slice(0, 5000),
      tipo,
      categoria: inferPyPICategory(info.classifiers),
      lenguaje_principal: 'Python',
      url_repositorio: repoUrl,
      url_documentacion: docsUrl,
      comando_instalacion: `pip install ${info.name}`,
      identificador_externo: info.name,
      fuente_origen: 'pypi',
    };
  },
};

function inferPyPIType(classifiers?: string[]): 'API' | 'Framework' | 'Library' {
  if (!classifiers) return 'Library';

  for (const c of classifiers) {
    if (c.includes('Framework')) return 'Framework';
  }
  return 'Library';
}

function inferPyPICategory(classifiers?: string[]): string {
  if (!classifiers) return 'General';

  const categoryMap: Record<string, string> = {
    'Scientific/Engineering': 'Data Science',
    'Internet :: WWW/HTTP': 'Web',
    'Database': 'Database',
    'Software Development :: Testing': 'Testing',
    'Software Development :: Libraries': 'General',
  };

  for (const c of classifiers) {
    for (const [pattern, category] of Object.entries(categoryMap)) {
      if (c.includes(pattern)) return category;
    }
  }

  return 'General';
}
