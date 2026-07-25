export interface TechnologyStats {
	license?: string | null;
	weeklyDownloads?: number;
	version?: string;
	quality?: number;
	popularity?: number;
	requires_python?: string;
	group_id?: string;
	artifact_id?: string;
	versions?: string[];
}

export interface Technology {
	id: number;
	slug: string;
	nombre: string;
	tipo: 'api' | 'framework' | 'libreria' | 'herramienta';
	lenguaje: 'javascript' | 'python' | 'java';
	ecosistema: string;
	categoria: string;
	descripcion: string;
	logo_url: string;
	repo_url: string;
	docs_url: string;
	homepage_url: string;
	version?: string;
	stats: TechnologyStats;
	tags: string[];
	key_features: string[];
	use_cases: string[];
	installation: string;
	created_at: string;
	updated_at: string;
}

export interface Pagination {
	page: number;
	limit: number;
	total: number;
	pages: number;
}

export interface TechnologiesResponse {
	items: Technology[];
	pagination: Pagination;
}

export interface Category {
	categoria: string;
	count: string;
}

export interface Ecosystem {
	ecosistema: string;
	count: string;
}

export type TechnologyType = 'api' | 'framework' | 'libreria' | 'herramienta';
export type TechnologyLanguage = 'javascript' | 'python' | 'java';

/** Modelo plano que consume la UI de librerías (server y cliente). */
export interface CatalogEntry {
	id: string;
	slug: string;
	name: string;
	description: string;
	language: string;
	languageLabel: string;
	languageIcon: string;
	category: string;
	categoryLabel: string;
	type: string;
	ecosystem: string;
	version?: string;
	license?: string;
	downloads?: string;
	isPopular: boolean;
	installCommand: string;
	docsUrl: string;
	repoUrl: string;
	tags: string[];
}
