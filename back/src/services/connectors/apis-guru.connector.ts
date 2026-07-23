import type { ExternalConnector } from '../../types/connector.types.js';
import type { ExternalTechnology } from '../../types/technology.types.js';
import { createConnectorClient } from './connector.interface.js';
import * as cacheService from '../cache.service.js';

const { client, limiter } = createConnectorClient({
  baseUrl: 'https://api.apis.guru/v2',
});

interface ApisGuruListEntry {
  added: string;
  preferred: string;
  versions: Record<
    string,
    {
      info: {
        title: string;
        description?: string;
        'x-logo'?: { url: string };
      };
      swaggerUrl?: string;
      externalDocs?: { url: string };
    }
  >;
}

type ApisGuruList = Record<string, ApisGuruListEntry>;

export const apisGuruConnector: ExternalConnector = {
  source: 'apis-guru',

  async fetchList(params: { offset: number; limit: number }): Promise<ExternalTechnology[]> {
    const data = await cacheService.getOrFetch<ApisGuruList>(
      'list.json',
      'apis-guru',
      async () => {
        const response = await limiter.schedule(() => client.get<ApisGuruList>('/list.json'));
        return response.data;
      }
    );

    const entries = Object.entries(data);
    const paginated = entries.slice(params.offset, params.offset + params.limit);

    return paginated.map(([key, entry]) => {
      const preferredVersion = entry.versions[entry.preferred];
      const info = preferredVersion?.info;

      return {
        nombre: info?.title ?? key,
        descripcion: info?.description?.slice(0, 5000),
        tipo: 'API' as const,
        categoria: 'Web API',
        url_documentacion: preferredVersion?.externalDocs?.url,
        identificador_externo: key,
        fuente_origen: 'apis-guru',
      };
    });
  },

  async fetchDetail(identifier: string): Promise<ExternalTechnology | null> {
    const data = await cacheService.getOrFetch<ApisGuruList>(
      'list.json',
      'apis-guru',
      async () => {
        const response = await limiter.schedule(() => client.get<ApisGuruList>('/list.json'));
        return response.data;
      }
    );

    const entry = data[identifier];
    if (!entry) return null;

    const preferredVersion = entry.versions[entry.preferred];
    const info = preferredVersion?.info;

    return {
      nombre: info?.title ?? identifier,
      descripcion: info?.description?.slice(0, 5000),
      tipo: 'API',
      categoria: 'Web API',
      url_documentacion: preferredVersion?.externalDocs?.url,
      identificador_externo: identifier,
      fuente_origen: 'apis-guru',
    };
  },
};
