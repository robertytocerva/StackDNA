const axios = require("axios");

const API_BASE = "https://artificialanalysis.ai/api/v2/language/models/free";

/**
 * Fetches all pages from the Artificial Analysis free tier API
 * and normalizes the data into the shape the frontend expects.
 */
async function fetchAllModels() {
  const apiKey = process.env.AA_API_KEY;
  if (!apiKey) {
    throw new Error("AA_API_KEY not configured");
  }

  const allData = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 10) {
    const res = await axios.get(API_BASE, {
      params: { page },
      headers: {
        "x-api-key": apiKey,
        "Accept": "application/json",
      },
      timeout: 15000,
    });

    const items = res.data?.data || [];
    allData.push(...items);
    hasMore = res.data?.pagination?.has_more ?? false;
    page++;
  }

  return normalizeModels(allData);
}

/**
 * Maps the raw API v2 free-tier response into our frontend Model shape.
 */
function normalizeModels(rawList) {
  return rawList
    .map((m) => {
      const creator = m.model_creator || {};
      const evals = m.evaluations || {};
      const pricing = m.pricing || {};
      const perf = m.performance || {};

      return {
        id: m.id || m.slug || "",
        name: m.name || "",
        slug: m.slug || "",
        provider: creator.name || "Unknown",
        release: m.release_date || "",
        quality: evals.artificial_analysis_intelligence_index ?? null,
        coding_index: evals.artificial_analysis_coding_index ?? null,
        agentic_index: evals.artificial_analysis_agentic_index ?? null,
        speed_output: perf.median_output_tokens_per_second ?? null,
        ttft: perf.median_time_to_first_token_seconds ?? null,
        ttfat: perf.median_time_to_first_answer_token_seconds ?? null,
        e2e_latency: perf.median_end_to_end_response_time_seconds ?? null,
        price_input: pricing.price_1m_input_tokens ?? null,
        price_output: pricing.price_1m_output_tokens ?? null,
        price_cache_hit: pricing.price_1m_cache_hit_tokens ?? null,
        price_cache_write: pricing.price_1m_cache_write_tokens ?? null,
      };
    })
    .filter((m) => m.name && m.quality != null && m.quality > 0);
}

// Simple in-memory cache (5 min TTL)
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000;

async function getModels() {
  const now = Date.now();
  if (cache.data && now - cache.timestamp < CACHE_TTL) {
    return { models: cache.data, fromCache: true };
  }

  const models = await fetchAllModels();
  cache = { data: models, timestamp: now };
  return { models, fromCache: false };
}

module.exports = { getModels };
