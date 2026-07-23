import type { ExternalConnector } from '../../types/connector.types.js';
import type { ExternalTechnology } from '../../types/technology.types.js';
import { createConnectorClient } from './connector.interface.js';
import { config } from '../../config/index.js';
import * as cacheService from '../cache.service.js';

const headers: Record<string, string> = {
  Accept: 'application/vnd.github.v3+json',
};

if (config.github.token) {
  headers['Authorization'] = `Bearer ${config.github.token}`;
}

const { client, limiter } = createConnectorClient({
  baseUrl: 'https://api.github.com',
  rateLimitPerMinute: config.github.token ? 30 : 10,
});

client.defaults.headers.common = { ...client.defaults.headers.common, ...headers };

interface GitHubSearchResponse {
  total_count: number;
  items: GitHubRepo[];
}

interface GitHubRepo {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
}

export const githubConnector: ExternalConnector = {
  source: 'github',

  async fetchList(params: { offset: number; limit: number }): Promise<ExternalTechnology[]> {
    const page = Math.floor(params.offset / params.limit) + 1;
    const cacheKey = `search:stars:${page}:${params.limit}`;

    const data = await cacheService.getOrFetch<GitHubSearchResponse>(
      cacheKey,
      'github',
      async () => {
        const response = await limiter.schedule(() =>
          client.get<GitHubSearchResponse>('/search/repositories', {
            params: {
              q: 'stars:>1000',
              sort: 'stars',
              order: 'desc',
              per_page: params.limit,
              page,
            },
          })
        );
        return response.data;
      }
    );

    return data.items.map((repo) => normalizeRepo(repo));
  },

  async fetchDetail(identifier: string): Promise<ExternalTechnology | null> {
    const data = await cacheService.getOrFetch<GitHubRepo>(
      `repo:${identifier}`,
      'github',
      async () => {
        const response = await limiter.schedule(() =>
          client.get<GitHubRepo>(`/repos/${identifier}`)
        );
        return response.data;
      }
    );

    if (!data?.full_name) return null;
    return normalizeRepo(data);
  },
};

function normalizeRepo(repo: GitHubRepo): ExternalTechnology {
  const tipo = inferTypeFromTopics(repo.topics);
  const categoria = inferCategoryFromTopics(repo.topics);

  return {
    nombre: repo.name,
    descripcion: repo.description?.slice(0, 5000) ?? undefined,
    tipo,
    categoria,
    lenguaje_principal: repo.language ?? undefined,
    url_repositorio: repo.html_url,
    url_documentacion: repo.homepage ?? undefined,
    estrellas_github: repo.stargazers_count,
    identificador_externo: repo.full_name,
    fuente_origen: 'github',
  };
}

function inferTypeFromTopics(topics: string[]): 'API' | 'Framework' | 'Library' {
  if (topics.some((t) => ['framework', 'web-framework'].includes(t))) return 'Framework';
  if (topics.some((t) => ['api', 'rest-api', 'graphql'].includes(t))) return 'API';
  return 'Library';
}

function inferCategoryFromTopics(topics: string[]): string {
  const categoryMap: Record<string, string> = {
    frontend: 'Frontend',
    react: 'Frontend',
    vue: 'Frontend',
    backend: 'Backend',
    'machine-learning': 'Machine Learning',
    'data-science': 'Data Science',
    database: 'Database',
    devops: 'DevOps',
    cli: 'CLI',
    testing: 'Testing',
  };

  for (const topic of topics) {
    const mapped = categoryMap[topic];
    if (mapped) return mapped;
  }

  return 'General';
}
