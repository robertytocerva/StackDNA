import type { ExternalConnector } from '../../types/connector.types.js';
import type { ExternalTechnology } from '../../types/technology.types.js';
import { createConnectorClient } from './connector.interface.js';
import * as cacheService from '../cache.service.js';

const { client, limiter } = createConnectorClient({
  baseUrl: 'https://registry.npmjs.com',
});

interface NpmSearchResult {
  objects: Array<{
    package: {
      name: string;
      description?: string;
      keywords?: string[];
      links?: {
        npm?: string;
        homepage?: string;
        repository?: string;
        bugs?: string;
      };
    };
    score: {
      final: number;
    };
  }>;
  total: number;
}

interface NpmPackageDetail {
  name: string;
  description?: string;
  'dist-tags'?: { latest?: string };
  keywords?: string[];
  homepage?: string;
  repository?: { type?: string; url?: string };
  readme?: string;
}

export const npmConnector: ExternalConnector = {
  source: 'npm',

  async fetchList(params: { offset: number; limit: number }): Promise<ExternalTechnology[]> {
    const cacheKey = `search:${params.offset}:${params.limit}`;

    const data = await cacheService.getOrFetch<NpmSearchResult>(
      cacheKey,
      'npm',
      async () => {
        const response = await limiter.schedule(() =>
          client.get<NpmSearchResult>('/-/v1/search', {
            params: { text: 'keywords:framework,library', size: params.limit, from: params.offset },
          })
        );
        return response.data;
      }
    );

    return data.objects.map((obj) => ({
      nombre: obj.package.name,
      descripcion: obj.package.description?.slice(0, 5000),
      tipo: 'Library' as const,
      categoria: inferCategory(obj.package.keywords),
      lenguaje_principal: 'JavaScript',
      url_repositorio: obj.package.links?.repository,
      url_documentacion: obj.package.links?.homepage,
      identificador_externo: obj.package.name,
      fuente_origen: 'npm',
    }));
  },

  async fetchDetail(identifier: string): Promise<ExternalTechnology | null> {
    const data = await cacheService.getOrFetch<NpmPackageDetail>(
      `pkg:${identifier}`,
      'npm',
      async () => {
        const response = await limiter.schedule(() =>
          client.get<NpmPackageDetail>(`/${encodeURIComponent(identifier)}`)
        );
        return response.data;
      }
    );

    if (!data.name) return null;

    const repoUrl = data.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '');

    return {
      nombre: data.name,
      descripcion: data.description?.slice(0, 5000),
      tipo: 'Library',
      categoria: inferCategory(data.keywords),
      lenguaje_principal: 'JavaScript',
      url_repositorio: repoUrl,
      url_documentacion: data.homepage,
      comando_instalacion: `npm install ${data.name}`,
      identificador_externo: data.name,
      fuente_origen: 'npm',
    };
  },
};

function inferCategory(keywords?: string[]): string {
  if (!keywords || keywords.length === 0) return 'General';

  const categoryMap: Record<string, string> = {
    frontend: 'Frontend',
    react: 'Frontend',
    vue: 'Frontend',
    angular: 'Frontend',
    backend: 'Backend',
    server: 'Backend',
    express: 'Backend',
    database: 'Database',
    testing: 'Testing',
    cli: 'CLI',
    tooling: 'Tooling',
    bundler: 'Build Tools',
  };

  for (const kw of keywords) {
    const mapped = categoryMap[kw.toLowerCase()];
    if (mapped) return mapped;
  }

  return 'General';
}
