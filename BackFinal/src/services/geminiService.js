const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_PRIMARY = 'gemini-2.0-flash-lite';
const MODEL_FALLBACK = 'gemini-3.1-flash-lite';

async function analyzeProject(repoData) {
  const prompt = buildPrompt(repoData);
  return callGemini(prompt, MODEL_PRIMARY).catch(() => callGemini(prompt, MODEL_FALLBACK));
}

function callGemini(prompt, model) {
  return ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  }).then(response => {
    const text = response.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return getDefaultAnalysis(text);
  });
}

function buildPrompt(r) {
  const deps = (r.dependencies || []).filter(d => !d.isDev);
  const devDeps = (r.dependencies || []).filter(d => d.isDev);

  return `Analiza este repositorio de GitHub. Responde SOLO con un objeto JSON (sin markdown, sin fences). Responde TODO en español.

Repo: ${r.repo.name} | ${r.repo.stars} stars | ${r.repo.language} | ${r.repo.license || 'N/A'}
Descripción: ${r.repo.description || 'N/A'}
Archivos: ${r.structure.totalFiles} | Directorios: ${(r.structure.directories || []).slice(0, 10).join(', ')}
Lenguajes: ${(r.languages || []).map(l => `${l.name} ${l.percentage}%`).join(', ')}
Manifests: ${(r.manifests || []).join(', ')}
Dependencias(${deps.length}): ${deps.slice(0, 30).map(d => d.name).join(', ')}
DevDependencies(${devDeps.length}): ${devDeps.slice(0, 15).map(d => d.name).join(', ')}
Vulnerabilidades: ${(r.vulnerabilities || []).map(v => `${v.package}:${v.severity}`).join(', ') || 'Ninguna'}
README: ${(r.readme || '').slice(0, 1500)}

{"summary":"Resumen de 2-3 oraciones del proyecto","architecture":"Tipo de arquitectura (monorepo, MVC, etc.)","qualityScore":0-100,"strengths":["3-5 fortalezas"],"improvements":["3-5 mejoras específicas"],"securityConcerns":["preocupaciones de seguridad o array vacío"],"techStackSummary":{"frameworks":[],"tools":[],"patterns":[]},"recommendations":["2-3 recomendaciones accionables"]}`;
}

function getDefaultAnalysis(summary) {
  return {
    summary,
    architecture: 'No determinada',
    qualityScore: 0,
    strengths: [],
    improvements: [],
    securityConcerns: [],
    techStackSummary: { frameworks: [], tools: [], patterns: [] },
    recommendations: [],
  };
}

module.exports = { analyzeProject };
