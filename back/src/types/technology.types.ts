export interface Technology {
  id: string;
  nombre: string;
  slug: string;
  tipo: 'API' | 'Framework' | 'Library';
  categoria: string | null;
  lenguaje_principal: string | null;
  descripcion: string | null;
  url_repositorio: string | null;
  url_documentacion: string | null;
  estrellas_github: number;
  descargas_semanales: number;
  comando_instalacion: string | null;
  ejemplo_helloworld: string | null;
  fuente_origen: string;
  identificador_externo: string;
  que_es: string | null;
  caso_uso_principal: string | null;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface ExternalTechnology {
  nombre: string;
  descripcion?: string;
  tipo: 'API' | 'Framework' | 'Library';
  categoria?: string;
  lenguaje_principal?: string;
  url_repositorio?: string;
  url_documentacion?: string;
  estrellas_github?: number;
  descargas_semanales?: number;
  comando_instalacion?: string;
  ejemplo_helloworld?: string;
  identificador_externo: string;
  fuente_origen: string;
  que_es?: string;
  caso_uso_principal?: string;
}

export interface TechnologyFilters {
  query?: string;
  type?: 'API' | 'Framework' | 'Library';
  category?: string;
  language?: string;
  sort?: 'popularity' | 'downloads' | 'recent';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface CreateTechnologyDTO {
  nombre: string;
  slug: string;
  tipo: 'API' | 'Framework' | 'Library';
  categoria?: string | null;
  lenguaje_principal?: string | null;
  descripcion?: string | null;
  url_repositorio?: string | null;
  url_documentacion?: string | null;
  estrellas_github?: number;
  descargas_semanales?: number;
  comando_instalacion?: string | null;
  ejemplo_helloworld?: string | null;
  fuente_origen: string;
  identificador_externo: string;
  que_es?: string | null;
  caso_uso_principal?: string | null;
}
