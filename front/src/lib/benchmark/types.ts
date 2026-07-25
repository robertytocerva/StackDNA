/**
 * Model interface adapted to the free tier of Artificial Analysis API v2.
 */
export interface Model {
  id: string;
  name: string;
  slug: string;
  provider: string;
  release: string;
  quality: number;
  coding_index: number | null;
  agentic_index: number | null;
  cost_per_task: number | null;
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
