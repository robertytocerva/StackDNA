/**
 * Model interface adapted to the free tier of Artificial Analysis API v2.
 * Only includes fields available at /api/v2/language/models/free
 */
export interface Model {
  id: string;
  name: string;
  slug: string;
  provider: string;
  release: string;
  quality: number;
  speed_output: number;
  ttft: number;
  price_input: number;
  price_output: number;
}

export interface FetchResult {
  data: Model[];
  isLive: boolean;
}

export type SortKey = 'quality' | 'speed' | 'price_out' | 'release';
