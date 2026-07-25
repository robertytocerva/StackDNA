/**
 * StackADN — AI Models Benchmark
 * Client script adapted to free tier API (no benchmarks, no context, no capabilities).
 */

import { fetchModels } from '../lib/benchmark/api';
import { fmt, formatSeq, getProviderLogo } from '../lib/benchmark/format';
import type { Model, SortKey } from '../lib/benchmark/types';

let allModels: Model[] = [];
let filteredModels: Model[] = [];
let activeProvider = 'all';
let currentSort: SortKey = 'quality';
let currentSearch = '';

// --- FRESHNESS ---
function updateFreshness(isLive: boolean) {
  const badge = document.getElementById('freshnessBadge')!;
  const text = document.getElementById('freshnessText')!;
  if (isLive) {
    badge.classList.remove('fallback');
    text.textContent = 'LIVE · ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } else {
    badge.classList.add('fallback');
    text.textContent = 'DATOS LOCALES';
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
  applyFilters();
}

// --- FILTERS ---
function applyFilters() {
  filteredModels = allModels.filter(m => {
    if (activeProvider !== 'all' && m.provider !== activeProvider) return false;
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.provider.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  filteredModels.sort((a, b) => {
    switch (currentSort) {
      case 'speed': return (b.speed_output || 0) - (a.speed_output || 0);
      case 'price_out': return (a.price_output || 999) - (b.price_output || 999);
      case 'release': return new Date(b.release || '').getTime() - new Date(a.release || '').getTime();
      default: return (b.quality || 0) - (a.quality || 0);
    }
  });
  renderStack();
}

// --- DNA SVG ---
function buildDnaSvg(): string {
  let rungs = '';
  for (let i = 0; i < 8; i++) {
    const y = i * 20 + 10;
    const offset = Math.sin(i * 0.78) * 8;
    rungs += `<line class="strand-rung" x1="${10 - offset}" y1="${y}" x2="${10 + offset}" y2="${y}"/>`;
    rungs += `<circle class="strand-dot" cx="${10 - offset}" cy="${y}" r="1.2"/>`;
    rungs += `<circle class="strand-dot" cx="${10 + offset}" cy="${y}" r="1.2"/>`;
  }
  return `
    <svg viewBox="0 0 20 160" preserveAspectRatio="none">
      <g class="dna-anim">
        <path class="strand-line" d="M 10 0 Q 18 20, 10 40 T 10 80 T 10 120 T 10 160"/>
        <path class="strand-line" d="M 10 0 Q 2 20, 10 40 T 10 80 T 10 120 T 10 160"/>
        ${rungs}
      </g>
    </svg>
  `;
}

// --- RENDER STACK ---
function renderStack() {
  const container = document.getElementById('stackContainer')!;
  const empty = document.getElementById('emptyState')!;
  if (!filteredModels.length) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  const maxPriceOut = Math.max(...allModels.map(m => m.price_output || 0));
  const maxSpeed = Math.max(...allModels.map(m => m.speed_output || 0));

  container.innerHTML = filteredModels.map((m, idx) => {
    const seq = formatSeq(idx + 1);
    const logo = getProviderLogo(m.provider);
    return `
      <article class="stack-card" data-id="${m.id}">
        <div class="dna-side">
          <div class="seq-number">${seq}</div>
          <div class="dna-strand">${buildDnaSvg()}</div>
        </div>
        <div class="card-body">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:8px">
              <img class="provider-logo" src="${logo}" alt="${m.provider}" width="24" height="24" />
              <div>
                <h2 class="model-name"><span class="provider">${m.provider}</span>${m.name}</h2>
                <div class="model-meta">
                  <span>● ${fmt.date(m.release)}</span>
                </div>
              </div>
            </div>
            <div class="quality-badge">
              <div class="quality-score">${m.quality != null ? m.quality.toFixed(1) : '—'}</div>
              <div class="quality-label">Quality Index</div>
            </div>
          </div>
          <div class="metrics-grid">
            <div class="metric-box">
              <div class="metric-label">Throughput</div>
              <div class="metric-value">${Math.round(m.speed_output || 0)}<span class="unit">tok/s</span></div>
              <div class="bench-bar" style="margin-top:8px"><div class="bench-fill" data-w="${((m.speed_output || 0) / maxSpeed) * 100}"></div></div>
            </div>
            <div class="metric-box">
              <div class="metric-label">TTFT</div>
              <div class="metric-value">${m.ttft != null ? m.ttft.toFixed(2) : '—'}<span class="unit">s</span></div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Precio IN</div>
              <div class="metric-value"><span class="currency">$</span>${(m.price_input || 0).toFixed(2)}<span class="unit">/M</span></div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Precio OUT</div>
              <div class="metric-value"><span class="currency">$</span>${(m.price_output || 0).toFixed(2)}<span class="unit">/M</span></div>
              <div class="bench-bar" style="margin-top:8px"><div class="bench-fill" data-w="${((m.price_output || 0) / maxPriceOut) * 100}"></div></div>
            </div>
          </div>
          <div class="flex justify-between items-center pt-2" style="border-top:1px solid var(--border)">
            <div class="text-[11px] mono" style="color:var(--fg-muted)">
              IN: $${(m.price_input || 0).toFixed(2)}/M · OUT: $${(m.price_output || 0).toFixed(2)}/M
            </div>
            <button class="expand-btn" data-expand="${m.id}">→ expandir</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  requestAnimationFrame(() => {
    document.querySelectorAll('.bench-fill').forEach(el => {
      const w = parseFloat((el as HTMLElement).dataset.w || '0');
      setTimeout(() => (el as HTMLElement).style.width = Math.min(100, w) + '%', 50);
    });
  });
  setTimeout(() => { container.classList.add('visible'); }, 50);
}

// --- MODAL ---
function openModal(id: string) {
  const m = allModels.find(x => x.id === id);
  if (!m) return;
  const card = document.getElementById('modalCard')!;
  card.innerHTML = `
    <div class="flex justify-between items-start mb-6">
      <div>
        <div class="text-xs mono uppercase tracking-widest mb-2" style="color:var(--accent-bright)">${m.provider}</div>
        <h2 class="text-3xl font-bold mb-2">${m.name}</h2>
        <div class="text-sm mono" style="color:var(--fg-muted)">Lanzamiento: ${fmt.date(m.release)}</div>
      </div>
      <button id="closeModalBtn" class="expand-btn">✕ cerrar</button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div class="metric-box"><div class="metric-label">Quality Index</div><div class="metric-value" style="font-size:24px;color:var(--accent-bright)">${m.quality?.toFixed(1) || '—'}</div></div>
      <div class="metric-box"><div class="metric-label">Throughput</div><div class="metric-value">${Math.round(m.speed_output || 0)}<span class="unit">tok/s</span></div></div>
      <div class="metric-box"><div class="metric-label">TTFT</div><div class="metric-value">${m.ttft?.toFixed(2) || '—'}<span class="unit">s</span></div></div>
      <div class="metric-box"><div class="metric-label">Latencia total</div><div class="metric-value">${m.ttft ? (m.ttft + 1).toFixed(2) : '—'}<span class="unit">s est.</span></div></div>
    </div>
    <div class="mb-6">
      <h3 class="text-sm mono uppercase tracking-widest mb-3" style="color:var(--fg-dim)">Pricing (por millón de tokens)</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="metric-box"><div class="metric-label">Input</div><div class="metric-value">$${(m.price_input || 0).toFixed(4)}</div></div>
        <div class="metric-box"><div class="metric-label">Output</div><div class="metric-value">$${(m.price_output || 0).toFixed(4)}</div></div>
        <div class="metric-box"><div class="metric-label">Ratio I/O</div><div class="metric-value">${m.price_input && m.price_output ? (m.price_output / m.price_input).toFixed(1) + '×' : '—'}</div></div>
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
            ${renderPodiumSpot(third, 3, 'height-3', '', p.formatFn)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- EVENT LISTENERS ---
document.getElementById('searchInput')!.addEventListener('input', (e) => {
  currentSearch = (e.target as HTMLInputElement).value;
  applyFilters();
});
document.getElementById('sortSelect')!.addEventListener('change', (e) => {
  currentSort = (e.target as HTMLSelectElement).value as SortKey;
  applyFilters();
});
document.getElementById('modalOverlay')!.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).id === 'modalOverlay') closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('.expand-btn[data-expand]') as HTMLElement | null;
  if (btn) {
    openModal(btn.dataset.expand!);
  }
});

// --- INIT ---
async function init() {
  const { data, isLive } = await fetchModels();
  allModels = data;
  updateFreshness(isLive);
  renderStats(allModels);
  renderProviderFilters(allModels);
  renderPodiums(allModels);
  applyFilters();
}

init();
