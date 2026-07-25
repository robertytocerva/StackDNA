import type { Model, FetchResult } from './types';
import { FALLBACK_MODELS } from './fallbackModels';

const ENDPOINTS = [
  'https://artificialanalysis.ai/api/models/tables/models-table',
  'https://corsproxy.io/?url=https://artificialanalysis.ai/api/models/tables/models-table',
];

function getAllOriginsUrl(): string {
  return 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://artificialanalysis.ai/api/models/tables/models-table');
}

export function normalizeApiData(raw: unknown): Model[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : ((raw as any).data || (raw as any).models || (raw as any).rows || []);
  if (!Array.isArray(list)) return [];
  return list.map((m: any) => ({
    id: m.id || m.model_id || m.name,
    name: m.name || m.model_name || m.id,
    provider: m.provider || m.organization || m.company || '—',
    release: m.release_date || m.released || m.date || '',
    context: m.context_window || m.context || m.max_context || 0,
    speed_output: m.output_speed || m.speed_output || m.throughput || 0,
    ttft: m.ttft || m.time_to_first_token || 0,
    quality: m.quality_index ?? m.quality ?? m.score ?? 0,
    price_input: m.input_price ?? m.price_input ?? 0,
    price_output: m.output_price ?? m.price_output ?? 0,
    mmlu: m.mmlu ?? null,
    humaneval: m.humaneval ?? null,
    math: m.math ?? null,
    gpqa: m.gpqa ?? null,
    capabilities: {
      vision: m.vision ?? m.multimodal ?? false,
      tools: m.tools ?? m.tool_use ?? false,
      reasoning: m.reasoning ?? m.reason ?? false,
    },
  })).filter((m: Model) => m.name && m.quality != null);
}

export async function fetchModels(): Promise<FetchResult> {
  const allUrls = [...ENDPOINTS, getAllOriginsUrl()];

  for (const url of allUrls) {
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!res.ok) continue;
      const data = await res.json();
      const normalized = normalizeApiData(data);
      if (normalized.length > 0) {
        return { data: normalized, isLive: true };
      }
    } catch (e) {
      console.warn('Endpoint falló:', url, (e as Error).message);
    }
  }

  return { data: FALLBACK_MODELS, isLive: false };
}
