import type { Model } from './types';

/**
 * Fallback dataset when the live API is unreachable.
 * Only includes fields available in the free tier.
 */
export const FALLBACK_MODELS: Model[] = [
  { id: "claude-3-5-sonnet", slug: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", release: "2024-10-22", speed_output: 78.3, ttft: 0.71, quality: 78.3, price_input: 3.0, price_output: 15.0 },
  { id: "gpt-4o", slug: "gpt-4o", name: "GPT-4o", provider: "OpenAI", release: "2024-05-13", speed_output: 84.6, ttft: 0.46, quality: 77.5, price_input: 2.5, price_output: 10.0 },
  { id: "o1", slug: "o1", name: "o1", provider: "OpenAI", release: "2024-12-05", speed_output: 36.0, ttft: 8.5, quality: 79.0, price_input: 15.0, price_output: 60.0 },
  { id: "o3-mini", slug: "o3-mini", name: "o3-mini", provider: "OpenAI", release: "2025-01-31", speed_output: 85.0, ttft: 1.2, quality: 77.0, price_input: 1.1, price_output: 4.4 },
  { id: "gemini-2-pro", slug: "gemini-2-0-pro", name: "Gemini 2.0 Pro", provider: "Google", release: "2025-01-28", speed_output: 187.0, ttft: 1.12, quality: 75.8, price_input: 1.25, price_output: 5.0 },
  { id: "gemini-2-flash", slug: "gemini-2-0-flash", name: "Gemini 2.0 Flash", provider: "Google", release: "2025-02-05", speed_output: 217.0, ttft: 0.55, quality: 75.0, price_input: 0.10, price_output: 0.40 },
  { id: "deepseek-v3", slug: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", release: "2024-12-26", speed_output: 60.0, ttft: 0.85, quality: 75.7, price_input: 0.27, price_output: 1.10 },
  { id: "deepseek-r1", slug: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", release: "2025-01-20", speed_output: 38.0, ttft: 4.2, quality: 78.0, price_input: 0.55, price_output: 2.19 },
  { id: "llama-3-3-70b", slug: "llama-3-3-70b", name: "Llama 3.3 70B", provider: "Meta", release: "2024-12-06", speed_output: 320.0, ttft: 0.25, quality: 73.2, price_input: 0.20, price_output: 0.20 },
  { id: "claude-3-5-haiku", slug: "claude-3-5-haiku", name: "Claude 3.5 Haiku", provider: "Anthropic", release: "2024-11-04", speed_output: 80.0, ttft: 0.55, quality: 72.6, price_input: 0.80, price_output: 4.0 },
  { id: "mistral-large-2", slug: "mistral-large-2", name: "Mistral Large 2", provider: "Mistral", release: "2024-07-24", speed_output: 80.0, ttft: 0.50, quality: 73.2, price_input: 2.0, price_output: 6.0 },
  { id: "qwen-2-5-72b", slug: "qwen-2-5-72b", name: "Qwen 2.5 72B", provider: "Alibaba", release: "2024-11-28", speed_output: 70.0, ttft: 0.60, quality: 72.0, price_input: 0.35, price_output: 0.40 },
];
