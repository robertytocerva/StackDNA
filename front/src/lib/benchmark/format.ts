export const fmt = {
  num: (n: number | null | undefined): string => {
    if (n == null) return '—';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toFixed(n < 10 ? 1 : 0);
  },
  price: (n: number | null | undefined): string => {
    if (n == null) return '—';
    return '$' + n.toFixed(2);
  },
  pct: (n: number | null | undefined): string => {
    if (n == null) return '—';
    return n.toFixed(1) + '%';
  },
  ctx: (n: number | null | undefined): string => {
    if (n == null) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return Math.round(n / 1000) + 'K';
    return String(n);
  },
  date: (d: string | null | undefined): string => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  },
};

export function formatSeq(n: number): string {
  return '#' + String(n).padStart(3, '0');
}

export const providerLogos: Record<string, string> = {
  "OpenAI": "/logos/openai.svg",
  "Anthropic": "/logos/anthropic.svg",
  "Google": "/logos/google.svg",
  "DeepSeek": "/logos/deepseek.svg",
  "Meta": "/logos/meta.svg",
  "Mistral": "/logos/mistral.svg",
  "Alibaba": "/logos/alibaba.svg",
};

export function getProviderLogo(provider: string): string {
  return providerLogos[provider] || '/logos/default.svg';
}
