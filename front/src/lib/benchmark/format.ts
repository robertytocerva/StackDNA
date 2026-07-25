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
  "Anthropic": "/logos/anthropic.png",
  "Google": "/logos/google.svg",
  "DeepSeek": "/logos/deepseek.svg",
  "Meta": "/logos/meta.svg",
  "Mistral": "/logos/mistral.svg",
  "Alibaba": "/logos/alibaba.png",
  "Cohere": "/logos/cohere.svg",
  "xAI": "/logos/xai.svg",
  "AI21 Labs": "/logos/ai21.png",
  "AI9Stars": "/logos/ai9stars.svg",
  "Allen Institute for AI": "/logos/allen-institute-for-ai.svg",
  "Amazon": "/logos/amazon.png",
  "Arcee AI": "/logos/arcee-ai.svg",
  "Baidu": "/logos/baidu.svg",
  "ByteDance Seed": "/logos/bytedance-seed.svg",
  "China Mobile": "/logos/china-mobile.svg",
  "Databricks": "/logos/databricks.svg",
  "IBM": "/logos/ibm.png",
  "Inception": "/logos/inception.svg",
  "InclusionAI": "/logos/inclusionai.png",
  "Kimi": "/logos/kimi.svg",
  "Moonshot": "/logos/kimi.svg",
  "Korea Telecom": "/logos/korea-telecom.svg",
  "KwaiKAT": "/logos/kwaikat.svg",
  "LG AI Research": "/logos/lg-ai-research.svg",
  "Liquid AI": "/logos/liquid-ai.svg",
  "LongCat": "/logos/longcat.svg",
  "MBZUAI": "/logos/mbzuai.svg",
  "MBZUAI Institute of Foundation Models": "/logos/mbzuai.svg",
  "Microsoft": "/logos/microsoft.svg",
  "MiniMax": "/logos/minimax.svg",
  "Motif Technologies": "/logos/motif-technologies.svg",
  "Multiverse Computing": "/logos/multiverse-computing.svg",
  "NVIDIA": "/logos/nvidia.svg",
  "Nanbeige": "/logos/nanbeige.svg",
  "Naver": "/logos/naver.svg",
  "Nex AGI": "/logos/nex-agi.svg",
  "Nous Research": "/logos/nous-research.svg",
  "OpenBMB": "/logos/openbmb.svg",
  "OpenChat": "/logos/openchat.svg",
  "Perplexity": "/logos/perplexity.svg",
  "Prime Intellect": "/logos/prime-intellect.svg",
  "Reka AI": "/logos/reka-ai.svg",
  "Sapiens AI": "/logos/sapiens-ai.svg",
  "Sarvam": "/logos/sarvam.svg",
  "ServiceNow": "/logos/servicenow.svg",
  "Snowflake": "/logos/snowflake.svg",
  "SpaceXAI": "/logos/spacexai.svg",
  "SpaceX AI": "/logos/spacexai.svg",
  "StepFun": "/logos/stepfun.svg",
  "Swiss AI Initiative": "/logos/swiss-ai-initiative.svg",
  "TII UAE": "/logos/tii-uae.svg",
  "Tencent": "/logos/tencent.svg",
  "Thinking Machines": "/logos/thinking-machines.svg",
  "Trillion Labs": "/logos/trillion-labs.svg",
  "Upstage": "/logos/upstage.svg",
  "Xiaomi": "/logos/xiaomi.svg",
  "Zhipu": "/logos/zhipu.svg",
  "Z AI": "/logos/z-ai.svg",
};

export function getProviderLogo(provider: string): string {
  return providerLogos[provider] || '/logos/default.svg';
}
