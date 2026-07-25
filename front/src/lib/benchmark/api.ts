import type { Model, FetchResult } from './types';
import { FALLBACK_MODELS } from './fallbackModels';

/**
 * Artificial Analysis API v2 — Free tier endpoint.
 * Returns: quality index, median performance (speed, ttft), pricing (input/output).
 * Does NOT return: context window, benchmarks (MMLU, etc.), capabilities, modalities.
 */
const API_URL = 'https://artificialanalysis.ai/api/v2/language/models/free';

/**
 * Normalize API v2 free tier response into our Model interface.
 * The free tier response shape:
 * {
 *   data: [{
 *     id, name, slug, release_date,
 *     model_creator: { name, slug },
 *     evaluations: { artificial_analysis_intelligence_index },
 *     pricing: { input_token_price, output_token_price },
 *     performance: { median_output_tokens_per_second, median_time_to_first_token_seconds }
 *   }]
 * }
 */
export function normalizeApiData(raw: unknown): Model[] {
  if (!raw) return [];

  let list: any[];

  // Handle v2 paginated response
  if (typeof raw === 'object' && (raw as any).data && Array.isArray((raw as any).data)) {
    list = (raw as any).data;
  } else if (Array.isArray(raw)) {
    list = raw;
  } else {
    return [];
  }

  return list.map((m: any) => {
    // Extract nested fields from v2 structure
    const creator = m.model_creator || {};
    const evals = m.evaluations || {};
    const pricing = m.pricing || {};
    const perf = m.performance || {};

    return {
      id: m.id || m.slug || m.name || '',
      name: m.name || '',
      slug: m.slug || '',
      provider: creator.name || m.provider || m.organization || '—',
      release: m.release_date || '',
      quality: evals.artificial_analysis_intelligence_index ?? m.quality_index ?? m.quality ?? 0,
      speed_output: perf.median_output_tokens_per_second ?? m.output_speed ?? m.speed_output ?? 0,
      ttft: perf.median_time_to_first_token_seconds ?? m.ttft ?? 0,
      price_input: pricing.input_token_price ?? m.input_price ?? m.price_input ?? 0,
      price_output: pricing.output_token_price ?? m.output_price ?? m.price_output ?? 0,
    };
  }).filter((m: Model) => m.name && m.quality > 0);
}

/**
 * Fetch models from the free tier API.
 * Handles pagination (fetches all pages).
 * Falls back to local data if the API is unreachable.
 */
export async function fetchModels(): Promise<FetchResult> {
  try {
    const allData: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `${API_URL}?page=${page}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) break;

      const json = await res.json();
      const data = json.data || [];
      allData.push(...data);

      hasMore = json.pagination?.has_more ?? false;
      page++;

      // Safety: max 10 pages
      if (page > 10) break;
    }

    if (allData.length > 0) {
      const normalized = normalizeApiData({ data: allData });
      if (normalized.length > 0) {
        return { data: normalized, isLive: true };
      }
    }
  } catch (e) {
    console.warn('API fetch failed:', (e as Error).message);
  }

  // Fallback to local data
  return { data: FALLBACK_MODELS, isLive: false };
}
