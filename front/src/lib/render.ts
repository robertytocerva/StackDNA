import type { CatalogEntry, Technology } from './types';
import { LANGUAGES, getCategoryLabel } from './api';
import { getSnippets, hasCuratedSnippets, type Snippet, type SnippetLanguage } from './snippets';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('xml', xml);

/**
 * Renderers compartidos: la página los usa en el servidor (set:html) y el script
 * del cliente los reutiliza al re-renderizar tras una búsqueda o un filtro.
 * Los estilos viven en src/styles/librerias.css (globales, no scoped).
 */

const LANGUAGE_ORDER = LANGUAGES.map((language) => language.label);

export function escapeHtml(value: unknown): string {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function safeUrl(url: string): string {
	return /^https?:\/\//i.test(url) ? escapeHtml(url) : '';
}

export function groupByLanguage(entries: CatalogEntry[]): Array<[string, CatalogEntry[]]> {
	const groups = new Map<string, CatalogEntry[]>();

	for (const entry of entries) {
		const bucket = groups.get(entry.languageLabel);
		if (bucket) bucket.push(entry);
		else groups.set(entry.languageLabel, [entry]);
	}

	return [...groups.entries()].sort(
		([a], [b]) => (LANGUAGE_ORDER.indexOf(a) + 1 || 99) - (LANGUAGE_ORDER.indexOf(b) + 1 || 99),
	);
}

export function renderLibraryCard(entry: CatalogEntry): string {
	const docsUrl = safeUrl(entry.docsUrl);
	const install = entry.installCommand === 'built-in' ? 'Built-in' : entry.installCommand;
	const name = escapeHtml(entry.name);

	return `
	<article class="library-card" data-library-card data-slug="${escapeHtml(entry.slug)}" data-language="${escapeHtml(entry.languageLabel)}" data-category="${escapeHtml(entry.category)}">
		<header class="library-card-header">
			<div class="library-identity">
				<div class="library-icon" aria-hidden="true">
					<img src="${escapeHtml(entry.languageIcon)}" alt="" loading="lazy" />
				</div>
				<div class="library-heading">
					<div class="library-name-row">
						<h3>${name}</h3>
						${entry.isPopular ? '<span class="popular-badge"><span aria-hidden="true">✦</span> Popular</span>' : ''}
					</div>
					<p>${escapeHtml(entry.description)}</p>
				</div>
			</div>
			${docsUrl ? `<a class="docs-link" href="${docsUrl}" target="_blank" rel="noreferrer" aria-label="Abrir documentación de ${name}">Docs <span aria-hidden="true">↗</span></a>` : ''}
		</header>

		<div class="library-meta">
			<span class="install-chip"><span class="meta-symbol" aria-hidden="true">$</span><code>${escapeHtml(install)}</code></span>
			<span class="category-chip"><span class="meta-symbol" aria-hidden="true">#</span>${escapeHtml(entry.categoryLabel)}</span>
			${entry.version ? `<span class="version-chip"><span class="meta-symbol" aria-hidden="true">v</span>${escapeHtml(entry.version)}</span>` : ''}
			${entry.downloads ? `<span class="version-chip"><span class="meta-symbol" aria-hidden="true">↓</span>${escapeHtml(entry.downloads)}</span>` : ''}
		</div>

		<div class="library-detail" data-detail-panel hidden></div>

		<footer class="library-card-footer">
			<span>${escapeHtml(entry.ecosystem)} · ${escapeHtml(entry.type)}${entry.license ? ` · ${escapeHtml(entry.license)}` : ''}</span>
			<button class="detail-toggle" type="button" data-detail-toggle aria-expanded="false">
				Ver ejemplo${hasCuratedSnippets(entry.slug) ? '' : ' base'}
			</button>
		</footer>
	</article>`;
}

export function renderLanguageSection(language: string, entries: CatalogEntry[]): string {
	const id = language.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	const icon = entries[0]?.languageIcon ?? '/favicon.svg';

	return `
	<section class="language-section" data-language-section="${escapeHtml(language)}" aria-labelledby="language-${id}">
		<header class="language-section-header">
			<div class="language-title-wrap">
				<span class="language-index" aria-hidden="true">//</span>
				<span class="language-icon" aria-hidden="true"><img src="${escapeHtml(icon)}" alt="" loading="lazy" /></span>
				<div>
					<h2 id="language-${id}">${escapeHtml(language)}</h2>
					<p>Biblioteca de ${escapeHtml(language)}</p>
				</div>
			</div>
			<span class="language-count"><strong>${String(entries.length).padStart(2, '0')}</strong> en esta página</span>
		</header>
		<div class="library-grid">${entries.map(renderLibraryCard).join('')}</div>
	</section>`;
}

export function renderResults(entries: CatalogEntry[]): string {
	return groupByLanguage(entries)
		.map(([language, group]) => renderLanguageSection(language, group))
		.join('');
}

const SNIPPET_LANGUAGE_LABELS: Record<SnippetLanguage, string> = {
	javascript: 'JavaScript',
	python: 'Python',
	java: 'Java',
	bash: 'Shell',
	xml: 'XML',
};

function highlight(code: string, language: SnippetLanguage): string {
	try {
		return hljs.highlight(code, { language }).value;
	} catch {
		return escapeHtml(code);
	}
}

/** Bloque de código con numeración, resaltado, salida esperada y botón de copiar. */
export function renderSnippet(snippet: Snippet): string {
	const lines = highlight(snippet.code, snippet.language)
		.split('\n')
		.map(
			(line, index) =>
				`<span class="code-line"><span class="line-number" aria-hidden="true">${index + 1}</span><span class="line-text">${line || '&nbsp;'}</span></span>`,
		)
		.join('');

	return `
		<article class="code-block" data-code-block>
			<header class="code-header">
				<div class="code-title">
					<span class="code-file-icon" aria-hidden="true">{ }</span>
					<span>${escapeHtml(snippet.title)}</span>
				</div>
				<div class="code-tools">
					<span class="language-badge">${escapeHtml(SNIPPET_LANGUAGE_LABELS[snippet.language])}</span>
					<button class="copy-button" type="button" data-copy-code aria-label="Copiar código: ${escapeHtml(snippet.title)}">
						<span data-copy-label>Copiar</span>
					</button>
				</div>
			</header>
			<div class="code-scroller" tabindex="0" aria-label="Código de ejemplo: ${escapeHtml(snippet.title)}">
				<code class="code-content">${lines}</code>
			</div>
			${
				snippet.output
					? `<div class="output-panel">
				<div class="output-heading"><span class="output-caret" aria-hidden="true">›</span> Output</div>
				<pre><code>${escapeHtml(snippet.output)}</code></pre>
			</div>`
					: ''
			}
			<template data-code-source>${escapeHtml(snippet.code)}</template>
		</article>`;
}

/** Lista de ejemplos de una librería (curados o generados). */
export function renderSnippets(entry: CatalogEntry): string {
	const snippets = getSnippets(entry);
	const generated = snippets.some((snippet) => snippet.generated);

	return `
		<div class="snippet-list">
			<div class="snippet-heading">
				<span>${snippets.length === 1 ? 'Ejemplo de uso' : `${snippets.length} ejemplos de uso`}</span>
				${generated ? '<span class="snippet-tag">plantilla generada</span>' : '<span class="snippet-tag is-curated">ejemplo curado</span>'}
			</div>
			${snippets.map(renderSnippet).join('')}
		</div>`;
}

/** Panel de detalle alimentado por GET /api/technologies/:slug. */export function renderDetailPanel(tech: Technology): string {
	const rows: Array<[string, string]> = [];

	if (tech.version) rows.push(['Versión', escapeHtml(tech.version)]);
	if (tech.stats?.license) rows.push(['Licencia', escapeHtml(tech.stats.license)]);
	if (tech.stats?.requires_python) rows.push(['Requiere Python', escapeHtml(tech.stats.requires_python)]);
	if (tech.categoria) rows.push(['Categoría', escapeHtml(getCategoryLabel(tech.categoria))]);
	if (tech.ecosistema) rows.push(['Ecosistema', escapeHtml(tech.ecosistema)]);
	if (tech.installation) rows.push(['Instalación', `<code>${escapeHtml(tech.installation)}</code>`]);

	const links = [
		['Repositorio', tech.repo_url],
		['Docs', tech.docs_url],
		['Homepage', tech.homepage_url],
	]
		.filter(([, url]) => safeUrl(String(url ?? '')))
		.map(([label, url]) => `<a href="${safeUrl(String(url))}" target="_blank" rel="noreferrer">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`)
		.join('');

	const tags = (Array.isArray(tech.tags) ? tech.tags.slice(0, 12) : [])
		.map((tag) => `<span class="detail-tag">${escapeHtml(tag)}</span>`)
		.join('');

	return `
		<dl class="detail-grid">
			${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${value}</dd></div>`).join('')}
		</dl>
		${tags ? `<div class="detail-tags">${tags}</div>` : ''}
		${links ? `<div class="detail-links">${links}</div>` : ''}`;
}
