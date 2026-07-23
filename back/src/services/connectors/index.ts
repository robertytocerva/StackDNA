import type { ExternalConnector } from '../../types/connector.types.js';
import { apisGuruConnector } from './apis-guru.connector.js';
import { npmConnector } from './npm.connector.js';
import { pypiConnector } from './pypi.connector.js';
import { githubConnector } from './github.connector.js';

export { apisGuruConnector } from './apis-guru.connector.js';
export { npmConnector } from './npm.connector.js';
export { pypiConnector } from './pypi.connector.js';
export { githubConnector } from './github.connector.js';

const connectors: Record<string, ExternalConnector> = {
  'apis-guru': apisGuruConnector,
  npm: npmConnector,
  pypi: pypiConnector,
  github: githubConnector,
};

/**
 * Returns all registered connectors.
 */
export function getAllConnectors(): ExternalConnector[] {
  return Object.values(connectors);
}

/**
 * Returns a connector by source name.
 */
export function getConnector(source: string): ExternalConnector | undefined {
  return connectors[source];
}
