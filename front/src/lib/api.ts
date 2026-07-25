import type {
	CatalogEntry,
	Category,
	Ecosystem,
	Technology,
	TechnologiesResponse,
	TechnologyLanguage,
	TechnologyType,
} from './types';

/**
 * URL del backend StackDNA. Se puede sobrescribir con la variable de entorno
 * PUBLIC_API_URL (debe ser PUBLIC_ para estar disponible en el navegador).
 */
export const API_BASE = (import.meta.env.PUBLIC_API_URL ?? 'https://stackdna.onrender.com').replace(/\/$/, '');

/** El backend valida limit entre 1 y 100 (express-validator). */
export const MAX_LIMIT = 100;

/** Resultados por página en la UI de librerías. */
export const PAGE_SIZE = 24;

/** Lenguajes soportados por el catálogo (`lang` en GET /api/technologies). */
export const LANGUAGES: Array<{ value: TechnologyLanguage; label: string; icon: string }> = [
	{ value: 'javascript', label: 'JavaScript', icon: '/jslogo.svg' },
	{ value: 'python', label: 'Python', icon: '/pylogo.svg' },
	{ value: 'java', label: 'Java', icon: '/javalogo.svg' },
];

const LANGUAGE_LABELS: Record<string, string> = Object.fromEntries(
	LANGUAGES.map((language) => [language.value, language.label]),
);

const LANGUAGE_ICONS: Record<string, string> = Object.fromEntries(
	LANGUAGES.map((language) => [language.value, language.icon]),
);

const CATEGORY_LABELS: Record<string, string> = {
	auth: 'Auth',
	cache: 'Cache',
	cli: 'CLI',
	config: 'Config',
	crypto: 'Crypto',
	csv: 'CSV',
	database: 'Database',
	'data-science': 'Data Science',
	date: 'Date & time',
	datetime: 'Date & time',
	email: 'Email',
	encryption: 'Encryption',
	files: 'Files',
	graphql: 'GraphQL',
	'http-client': 'HTTP Client',
	image: 'Image',
	json: 'JSON',
	logging: 'Logging',
	math: 'Math',
	middleware: 'Middleware',
	ml: 'Machine Learning',
	monitoring: 'Monitoring',
	networking: 'Networking',
	orm: 'ORM',
	pagos: 'Pagos',
	queue: 'Queue',
	scheduler: 'Scheduler',
	scraping: 'Scraping',
	security: 'Security',
	strings: 'Strings',
	system: 'System',
	testing: 'Testing',
	ui: 'UI',
	utilities: 'Utilities',
	utility: 'Utility',
	validation: 'Validation',
	'web-framework': 'Web Framework',
	websocket: 'WebSocket',
	xml: 'XML',
};

export interface SearchParams {
	query?: string;
	type?: TechnologyType;
	lang?: TechnologyLanguage | string;
	category?: string;
	page?: number;
	limit?: number;
}

export interface RequestOptions {
	signal?: AbortSignal;
}

async function fetchJSON<T>(url: string, options: RequestOptions = {}): Promise<T> {
	const response = await fetch(url, { signal: options.signal, headers: { Accept: 'application/json' } });

	if (!response.ok) {
		let detail = '';
		try {
			const body = await response.json();
			detail = body?.error ?? (Array.isArray(body?.errors) ? body.errors.map((e: any) => `${e.path}: ${e.msg}`).join(', ') : '');
		} catch {
			/* respuesta sin JSON */
		}
		throw new Error(`API ${response.status}${detail ? ` — ${detail}` : ''}`);
	}

	return response.json() as Promise<T>;
}

/** Construye la URL de GET /api/technologies respetando los límites del backend. */
export function buildTechnologiesUrl(params: SearchParams = {}): string {
	const searchParams = new URLSearchParams();
	const query = params.query?.trim();

	if (query) searchParams.set('query', query);
	if (params.type) searchParams.set('type', params.type);
	if (params.lang && params.lang !== 'all') searchParams.set('lang', String(params.lang).toLowerCase());
	if (params.category && params.category !== 'all') searchParams.set('category', params.category);
	if (params.page && params.page > 1) searchParams.set('page', String(Math.floor(params.page)));

	const limit = Math.min(Math.max(Math.floor(params.limit ?? PAGE_SIZE), 1), MAX_LIMIT);
	searchParams.set('limit', String(limit));

	return `${API_BASE}/api/technologies?${searchParams}`;
}

/** GET /api/technologies — búsqueda de texto libre + filtros de tipo, categoría y lenguaje. */
export function searchTechnologies(params: SearchParams = {}, options: RequestOptions = {}): Promise<TechnologiesResponse> {
	return fetchJSON<TechnologiesResponse>(buildTechnologiesUrl(params), options);
}

/** GET /api/technologies/:slug — detalle completo de una tecnología. */
export function getTechnology(slug: string, options: RequestOptions = {}): Promise<Technology> {
	return fetchJSON<Technology>(`${API_BASE}/api/technologies/${encodeURIComponent(slug)}`, options);
}

/** GET /api/categories — categorías con su conteo (para poblar el filtro). */
export function getCategories(options: RequestOptions = {}): Promise<Category[]> {
	return fetchJSON<Category[]>(`${API_BASE}/api/categories`, options);
}

/** GET /api/ecosystems — ecosistemas con su conteo. */
export function getEcosystems(options: RequestOptions = {}): Promise<Ecosystem[]> {
	return fetchJSON<Ecosystem[]>(`${API_BASE}/api/ecosystems`, options);
}

export function getLanguageIcon(language: string): string {
	return LANGUAGE_ICONS[language?.toLowerCase()] ?? '/favicon.svg';
}

export function getLanguageLabel(language: string): string {
	return LANGUAGE_LABELS[language?.toLowerCase()] ?? language;
}

export function getCategoryLabel(category: string): string {
	if (!category) return 'Sin categoría';
	return CATEGORY_LABELS[category] ?? category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDownloads(downloads: number): string {
	if (downloads >= 1_000_000) return `${(downloads / 1_000_000).toFixed(downloads >= 10_000_000 ? 0 : 1)}M/sem`;
	if (downloads >= 1_000) return `${Math.round(downloads / 1_000)}k/sem`;
	return `${downloads}/sem`;
}

/** Normaliza un Technology del backend al modelo que consume la UI. */
export function toCatalogEntry(tech: Technology): CatalogEntry {
	const stats = tech.stats ?? {};
	const weeklyDownloads = typeof stats.weeklyDownloads === 'number' ? stats.weeklyDownloads : undefined;

	return {
		id: String(tech.id),
		slug: tech.slug,
		name: tech.nombre,
		description: tech.descripcion || 'Sin descripción disponible.',
		language: tech.lenguaje,
		languageLabel: getLanguageLabel(tech.lenguaje),
		languageIcon: getLanguageIcon(tech.lenguaje),
		category: tech.categoria ?? '',
		categoryLabel: getCategoryLabel(tech.categoria ?? ''),
		type: tech.tipo,
		ecosystem: tech.ecosistema,
		version: tech.version ?? stats.version,
		license: stats.license ?? undefined,
		downloads: weeklyDownloads ? formatDownloads(weeklyDownloads) : undefined,
		isPopular: weeklyDownloads !== undefined && weeklyDownloads > 1_000_000,
		installCommand: tech.installation || 'built-in',
		docsUrl: tech.docs_url || tech.homepage_url || tech.repo_url || '',
		repoUrl: tech.repo_url ?? '',
		tags: Array.isArray(tech.tags) ? tech.tags.slice(0, 6) : [],
	};
}
