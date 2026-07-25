import type { Model, FetchResult } from './types';

const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3001';
const MODELS_ENDPOINT = `${BACKEND_URL}/api/benchmark/models`;

export async function fetchModels(): Promise<FetchResult> {
  try {
    const res = await fetch(MODELS_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Backend responded with ${res.status}`);
    }

    const json = await res.json();

    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      const models: Model[] = json.data.map((m: any) => ({
        id: m.id || '',
        name: m.name || '',
        slug: m.slug || '',
        provider: m.provider || 'Unknown',
        release: m.release || '',
        quality: m.quality ?? 0,
        coding_index: m.coding_index ?? null,
        agentic_index: m.agentic_index ?? null,
        cost_per_task: m.cost_per_task ?? null,
        speed_output: m.speed_output ?? 0,
        ttft: m.ttft ?? 0,
        price_input: m.price_input ?? 0,
        price_output: m.price_output ?? 0,
      }));

      return { data: models, isLive: true };
    }

    throw new Error('Empty or invalid response from backend');
  } catch (e) {
    console.warn('[Benchmark] Backend fetch failed:', (e as Error).message);
    return { data: [], isLive: false };
  }
}
