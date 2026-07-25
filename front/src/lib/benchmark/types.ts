/**
 * Model interface matching the original HTML data shape exactly.
 */
export interface Model {
  id: string;
  name: string;
  provider: string;
  release: string;
  context: number;
  speed_output: number;
  ttft: number;
  quality: number;
  price_input: number;
  price_output: number;
  mmlu: number | null;
  humaneval: number | null;
  math: number | null;
  gpqa: number | null;
  capabilities: {
    vision: boolean;
    tools: boolean;
    reasoning: boolean;
  };
}

export interface FetchResult {
  data: Model[];
  isLive: boolean;
}

export type SortKey = 'quality' | 'speed' | 'context' | 'price_out' | 'release';
