/**
 * StackADN — AI Models Benchmark
 * Bar chart visualization with 4 categories.
 */

import { fetchModels } from '../lib/benchmark/api';
import { fmt, getProviderLogo } from '../lib/benchmark/format';
import type { Model } from '../lib/benchmark/types';

let allModels: Model[] = [];
let activeProvider = 'all';
let currentSearch = '';

const MAX_BARS = 15;

// Providers considered Open Source / Chinese
const OSS_CHINESE_PROVIDERS = [
  'DeepSeek', 'Alibaba', 'Meta', 'Mistral', '01.AI', 'Zhipu', 'MiniMax',
  'Moonshot', 'Baichuan', 'ByteDance', 'StepFun', 'Nvidia', 'Cohere',
  'Together', 'Yi', 'THUDM', 'Tencent', 'iFlytek', 'SenseTime',
  'Kuaishou', 'ByteDance Seed'
];

// Provider brand colors for bar rendering
const PROVIDER_COLORS: Record<string, string> = {
  'OpenAI': '#10a37f',
  'Anthropic': '#d4a574',
  'Google': '#4285f4',
  'Meta': '#0081fb',
  'DeepSeek': '#4d6bfe',
  'Mistral': '#f97316',
  'Alibaba': '#ff6a00',
  'xAI': '#ffffff',
  'Cohere': '#39594d',
  'MiniMax': '#6366f1',
  'Zhipu': '#4f46e5',
  'Moonshot': '#8b5cf6',
  'ByteDance Seed': '#14b8a6',
};

function getBarColor(provider: string): string {
  return PROVIDER_COLORS[provider] || 'var(--accent-bright)';
}

// --- FRESHNESS ---
function updateFreshness(isLive: boolean) {
  const badge = document.getElementById('freshnessBadge')!;
  const text = document.getElementById('freshnessText')!;
  if (isLive) {
    badge.classList.remove('fallback');
    text.textContent = 'LIVE · ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } else {
    badge.classList.add('fallback');
    text.textContent = 'SIN CONEXIÓN';
  }
}

// --- STATS ---
function renderStats(models: Model[]) {
  if (!models.length) return;
  document.getElementById('statTotal')!.textContent = String(models.length);
  const topQ = [...models].sort((a, b) => (b.quality || 0) - (a.quality || 0))[0];
  document.getElementById('statTopQuality')!.textContent = topQ.quality?.toFixed(1) || '—';
  document.getElementById('statTopQualityName')!.textContent = topQ.name;
  const topS = [...models].sort((a, b) => (b.speed_output || 0) - (a.speed_output || 0))[0];
  document.getElementById('statTopSpeed')!.textContent = Math.round(topS.speed_output) + ' tok/s';
  document.getElementById('statTopSpeedName')!.textContent = topS.name;
  const valid = models.filter(m => m.price_output != null && m.price_output > 0);
  const topC = [...valid].sort((a, b) => a.price_output - b.price_output)[0];
  document.getElementById('statCheapest')!.textContent = '$' + topC.price_output.toFixed(2);
  document.getElementById('statCheapestName')!.textContent = topC.name;
}

// --- PROVIDER FILTERS ---
function renderProviderFilters(models: Model[]) {
  const providers = [...new Set(models.map(m => m.provider))].sort();
  const container = document.getElementById('providerFilters')!;
  container.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'filter-chip active';
  all.textContent = 'Todos';
  all.onclick = (e) => setProvider('all', e);
  container.appendChild(all);
  providers.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip';
    btn.textContent = p;
    btn.onclick = (e) => setProvider(p, e);
    container.appendChild(btn);
  });
}

function setProvider(p: string, e: Event) {
  activeProvider = p;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  (e.target as HTMLElement).classList.add('active');
  renderBarCharts();
}

// --- GET FILTERED MODELS ---
function getFilteredModels(): Model[] {
  return allModels.filter(m => {
    if (activeProvider !== 'all' && m.provider !== activeProvider) return false;
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.provider.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

// --- BAR CHART RENDERING ---
interface BarChartConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  getValue: (m: Model) => number | null;
  formatValue: (v: number) => string;
  filterFn?: (m: Model) => boolean;
  sortDir: 'desc' | 'asc'; // desc = higher is better, asc = lower is better
  unit: string;
}

const CHART_CONFIGS: BarChartConfig[] = [
  {
    id: 'intelligence',
    title: 'Inteligencia General',
    subtitle: 'AA Intelligence Index — Top modelos por calidad general',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>',
    getValue: m => m.quality,
    formatValue: v => v.toFixed(1),
    sortDir: 'desc',
    unit: 'pts',
  },
  {
    id: 'oss-chinese',
    title: 'Open Source + Chinos',
    subtitle: 'Mejores modelos de código abierto y proveedores chinos',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M3 7l9 6 9-6"/>',
    getValue: m => m.quality,
    formatValue: v => v.toFixed(1),
    filterFn: m => OSS_CHINESE_PROVIDERS.includes(m.provider),
    sortDir: 'desc',
    unit: 'pts',
  },
  {
    id: 'agentic',
    title: 'Mejores Agentes',
    subtitle: 'AA Agentic Index — Rendimiento en tareas de agente autónomo',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>',
    getValue: m => m.agentic_index,
    formatValue: v => v.toFixed(1),
    sortDir: 'desc',
    unit: 'pts',
  },
  {
    id: 'cost-per-task',
    title: 'Costo por Tarea',
    subtitle: 'Costo promedio en USD para ejecutar una tarea del Intelligence Index',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>',
    getValue: m => m.cost_per_task,
    formatValue: v => '$' + v.toFixed(3),
    sortDir: 'asc', // lower cost is better
    unit: '$/task',
  },
];

function renderBarCharts() {
  const container = document.getElementById('stackContainer')!;
  const empty = document.getElementById('emptyState')!;
  const filtered = getFilteredModels();

  if (!filtered.length) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  const sections = CHART_CONFIGS.map(config => {
    // Apply category-specific filter (like OSS/Chinese) on top of provider filter
    let pool = [...filtered];
    if (config.filterFn && activeProvider === 'all') {
      pool = pool.filter(config.filterFn);
    }

    // Filter out models with null values for this metric
    pool = pool.filter(m => {
      const v = config.getValue(m);
      return v != null && v > 0;
    });

    // Sort
    if (config.sortDir === 'desc') {
      pool.sort((a, b) => (config.getValue(b) || 0) - (config.getValue(a) || 0));
    } else {
      pool.sort((a, b) => (config.getValue(a) || 999) - (config.getValue(b) || 999));
    }

    // Limit to MAX_BARS
    pool = pool.slice(0, MAX_BARS);

    if (!pool.length) return '';

    // Calculate scale for bar height normalization
    const values = pool.map(m => config.getValue(m) || 0);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);

    // Show score inside bar for intelligence-type charts (first two)
    const showScoreInBar = config.id === 'intelligence' || config.id === 'oss-chinese';

    const bars = pool.map((m, idx) => {
      const val = config.getValue(m) || 0;

      let heightPct: number;
      if (config.sortDir === 'desc') {
        // Higher is better: proportional height from 30% floor to 100%
        // This ensures even the lowest bar is visible but differences are clear
        const range = maxVal - minVal;
        const normalized = range > 0 ? (val - minVal) / range : 1;
        heightPct = 30 + normalized * 70; // 30% to 100%
      } else {
        // Lower is better (cost): cheapest gets tallest bar
        const range = maxVal - minVal;
        const normalized = range > 0 ? (maxVal - val) / range : 1;
        heightPct = 30 + normalized * 70; // cheapest = 100%, most expensive = 30%
      }

      const color = getBarColor(m.provider);
      const logo = getProviderLogo(m.provider);
      const displayVal = showScoreInBar ? val.toFixed(0) : config.formatValue(val);

      return `
        <div class="bar-col" data-model-id="${m.id}" title="${m.name} — ${config.formatValue(val)}">
          <div class="bar-track">
            <div class="bar-fill-v" style="height:${heightPct}%;background:${color}" data-h="${heightPct}">
              <span class="bar-inner-value">${displayVal}</span>
            </div>
          </div>
          <img class="bar-logo" src="${logo}" alt="${m.provider}" width="18" height="18" />
          <div class="bar-label">${m.name.length > 14 ? m.name.slice(0, 12) + '…' : m.name}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="barchart-section" id="chart-${config.id}">
        <div class="barchart-header">
          <div class="barchart-icon">
            <svg style="width:18px;height:18px" fill="none" stroke="currentColor" viewBox="0 0 24 24">${config.icon}</svg>
          </div>
          <div>
            <div class="barchart-title">${config.title}</div>
            <div class="barchart-subtitle">${config.subtitle}</div>
          </div>
        </div>
        <div class="barchart-grid">${bars}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = sections;
  container.classList.add('visible');

  // Animate bars in
  requestAnimationFrame(() => {
    document.querySelectorAll('.bar-fill-v').forEach((el, i) => {
      const h = (el as HTMLElement).dataset.h || '0';
      (el as HTMLElement).style.height = '0%';
      setTimeout(() => {
        (el as HTMLElement).style.height = h + '%';
      }, 50 + i * 30);
    });
  });
}

// --- MODAL (detail on bar click) ---
function openModal(id: string) {
  const m = allModels.find(x => x.id === id);
  if (!m) return;
  const logo = getProviderLogo(m.provider);
  const card = document.getElementById('modalCard')!;
  card.innerHTML = `
    <div class="flex justify-between items-start mb-6">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="${logo}" alt="${m.provider}" width="36" height="36" style="object-fit:contain" />
        <div>
          <div class="text-xs mono uppercase tracking-widest mb-1" style="color:var(--accent-bright)">${m.provider}</div>
          <h2 class="text-2xl font-bold">${m.name}</h2>
          <div class="text-xs mono mt-1" style="color:var(--fg-muted)">Lanzamiento: ${fmt.date(m.release)}</div>
        </div>
      </div>
      <button id="closeModalBtn" class="expand-btn">✕ cerrar</button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div class="metric-box">
        <div class="metric-label">Intelligence Index</div>
        <div class="metric-value" style="font-size:22px;color:var(--accent-bright)">${m.quality?.toFixed(1) || '—'}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Agentic Index</div>
        <div class="metric-value" style="font-size:22px">${m.agentic_index?.toFixed(1) || '—'}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Coding Index</div>
        <div class="metric-value" style="font-size:22px">${m.coding_index?.toFixed(1) || '—'}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Costo/Tarea</div>
        <div class="metric-value" style="font-size:22px">${m.cost_per_task ? '$' + m.cost_per_task.toFixed(3) : '—'}</div>
      </div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div class="metric-box">
        <div class="metric-label">Throughput</div>
        <div class="metric-value">${Math.round(m.speed_output || 0)}<span class="unit">tok/s</span></div>
      </div>
      <div class="metric-box">
        <div class="metric-label">TTFT</div>
        <div class="metric-value">${m.ttft ? m.ttft.toFixed(2) : '—'}<span class="unit">s</span></div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Precio Input</div>
        <div class="metric-value">$${(m.price_input || 0).toFixed(2)}<span class="unit">/M</span></div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Precio Output</div>
        <div class="metric-value">$${(m.price_output || 0).toFixed(2)}<span class="unit">/M</span></div>
      </div>
    </div>
  `;
  document.getElementById('modalOverlay')!.classList.add('active');
  document.getElementById('closeModalBtn')!.addEventListener('click', closeModal);
}

function closeModal() {
  document.getElementById('modalOverlay')!.classList.remove('active');
}

// --- PODIUMS 3D ---
const OPEN_SOURCE_PROVIDERS = ['Meta', 'Mistral', 'DeepSeek', 'Alibaba', '01.AI', 'Zhipu', 'Nvidia', 'Cohere'];

function calcValuePerDollar(m: Model): number {
  if (!m.quality || !m.price_input || !m.price_output || m.price_input === 0) return 0;
  const avgPrice = (m.price_input + m.price_output) / 2;
  return m.quality / avgPrice;
}

function getTop3(models: Model[], sortFn: (a: Model, b: Model) => number, valueFn: (m: Model) => number | null, isOSS = false): Model[] {
  let pool = isOSS ? models.filter(m => OPEN_SOURCE_PROVIDERS.includes(m.provider)) : [...models];
  pool = pool.filter(m => { const v = valueFn(m); return v != null && v > 0; });
  pool.sort(sortFn);
  return pool.slice(0, 3);
}

function renderPodiumSpot(model: Model | undefined, rank: number, heightClass: string, lightClass: string, formatFn: (m: Model) => string): string {
  if (!model) return `<div class="podium-spot"></div>`;
  const logo = getProviderLogo(model.provider);
  return `
    <div class="podium-spot">
      ${lightClass ? `<div class="light-overlay ${lightClass}"></div>` : ''}
      <div class="podium-top-card">
        <div class="rank-tag r${rank}">#${rank} LUGAR</div>
        <img class="provider-logo" src="${logo}" alt="${model.provider}" width="24" height="24" style="margin:0 auto 4px" />
        <div class="model-name-3d">${model.name}</div>
        <div class="provider-3d">${model.provider}</div>
        <div class="value-3d">${formatFn(model)}</div>
      </div>
      <div class="podium-base ${heightClass}">${rank}</div>
    </div>
  `;
}

function renderPodiums(models: Model[]) {
  const grid = document.getElementById('podiumsGrid')!;

  const topIntel = getTop3(models, (a, b) => (b.quality || 0) - (a.quality || 0), m => m.quality);
  const topCheap = getTop3(models, (a, b) => (a.price_output || 999) - (b.price_output || 999), m => m.price_output);
  const topValue = getTop3(models, (a, b) => calcValuePerDollar(b) - calcValuePerDollar(a), m => calcValuePerDollar(m));
  const topOSS = getTop3(models, (a, b) => (b.quality || 0) - (a.quality || 0), m => m.quality, true);
  const topSpeed = getTop3(models, (a, b) => (b.speed_output || 0) - (a.speed_output || 0), m => m.speed_output);
  const topLatency = getTop3(models, (a, b) => (a.ttft || 999) - (b.ttft || 999), m => m.ttft > 0 ? m.ttft : null);

  const podiums = [
    {
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>',
      title: "Inteligencia General", subtitle: "Quality Index",
      top3: topIntel, formatFn: (m: Model) => m.quality?.toFixed(1) || '—'
    },
    {
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
      title: "Más Rápidos", subtitle: "Tokens por segundo",
      top3: topSpeed, formatFn: (m: Model) => `${Math.round(m.speed_output)} t/s`
    },
    {
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>',
      title: "Más Económicos", subtitle: "Costo por 1M tokens (Output)",
      top3: topCheap, formatFn: (m: Model) => `$${m.price_output?.toFixed(2)}`
    },
    {
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>',
      title: "Mejor Calidad/Precio", subtitle: "Puntos de calidad por $1",
      top3: topValue, formatFn: (m: Model) => calcValuePerDollar(m).toFixed(1)
    },
    {
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M3 7l9 6 9-6"/>',
      title: "Reyes del Open Source", subtitle: "Modelos de pesos abiertos",
      top3: topOSS, formatFn: (m: Model) => m.quality?.toFixed(1) || '—'
    },
    {
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
      title: "Menor Latencia", subtitle: "Time to First Token",
      top3: topLatency, formatFn: (m: Model) => `${m.ttft?.toFixed(2)}s`
    }
  ];

  grid.innerHTML = podiums.map(p => {
    const [first, second, third] = p.top3;
    return `
      <div class="podium-category-3d">
        <div class="podium-header">
          <div class="podium-icon">
            <svg style="width:18px;height:18px" fill="none" stroke="currentColor" viewBox="0 0 24 24">${p.icon}</svg>
          </div>
          <div>
            <div class="podium-title">${p.title}</div>
            <div class="podium-subtitle">${p.subtitle}</div>
          </div>
        </div>
        <div class="stage-3d">
          <div class="podium-3d">
            ${renderPodiumSpot(second, 2, 'height-2', 'light-silver', p.formatFn)}
            ${renderPodiumSpot(first, 1, 'height-1', 'light-gold', p.formatFn)}
            ${renderPodiumSpot(third, 3, 'height-3', 'light-bronze', p.formatFn)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- EVENT LISTENERS ---
document.getElementById('searchInput')!.addEventListener('input', (e) => {
  currentSearch = (e.target as HTMLInputElement).value;
  renderBarCharts();
});
document.getElementById('modalOverlay')!.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).id === 'modalOverlay') closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
// Delegated click on bar columns
document.addEventListener('click', (e) => {
  const barCol = (e.target as HTMLElement).closest('.bar-col') as HTMLElement | null;
  if (barCol) {
    const modelId = barCol.dataset.modelId;
    if (modelId) openModal(modelId);
  }
});

// --- INIT ---
async function init() {
  const { data, isLive } = await fetchModels();
  allModels = data;
  updateFreshness(isLive);

  if (!allModels.length) {
    document.getElementById('emptyState')!.classList.remove('hidden');
    document.getElementById('emptyState')!.innerHTML = `
      <div class="text-2xl mb-2">⚠</div>
      <div>No se pudieron cargar los modelos. Verifica que el backend esté corriendo.</div>
    `;
    return;
  }

  renderStats(allModels);
  renderProviderFilters(allModels);
  renderPodiums(allModels);
  renderBarCharts();
}

init();
