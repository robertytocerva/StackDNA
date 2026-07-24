type RepoAnalysisResponse = {
	repo?: {
		owner?: string;
		name?: string;
		description?: string | null;
		stars?: number;
		forks?: number;
		language?: string | null;
		license?: string | null;
		url?: string;
		homepage?: string | null;
		defaultBranch?: string;
		createdAt?: string;
		updatedAt?: string;
		pushedAt?: string;
		openIssues?: number;
		topics?: string[];
		size?: number;
	};
	stack?: {
		languages?: Array<{ name?: string; percentage?: number }>;
		dependencies?: Record<string, Array<{ name?: string; version?: string; isDev?: boolean }>>;
	};
	vulnerabilities?: Array<{
		id?: string;
		summary?: string;
		severity?: string;
		aliases?: string[];
		references?: string[];
		fixedVersion?: string | null;
		package?: string;
		ecosystem?: string;
		currentVersion?: string;
	}>;
	structure?: {
		directories?: string[];
		keyFiles?: string[];
		totalFiles?: number;
	};
	analysis?: {
		summary?: string;
		architecture?: string;
		qualityScore?: number;
		strengths?: string[];
		improvements?: string[];
		securityConcerns?: string[];
		techStackSummary?: {
			frameworks?: string[];
			tools?: string[];
			patterns?: string[];
		};
		recommendations?: string[];
	};
	catalogMatches?: Array<{ slug?: string; name?: string; matchScore?: number }>;
	analyzedAt?: string;
	rateLimit?: {
		limit?: number;
		remaining?: number;
		resetAt?: string;
	};
	cached?: boolean;
	error?: string;
};

const ENDPOINT = 'https://stackdna.onrender.com/api/repo-analyzer/analyze';

function escapeHtml(value: unknown): string {
	return String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

function formatNumber(value: number | undefined): string {
	return new Intl.NumberFormat('es-MX').format(value ?? 0);
}

function formatDate(value: string | undefined): string {
	if (!value) return 'Sin dato';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Sin dato';
	return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function getScoreColor(score: number): string {
	if (score >= 80) return '#22c55e';
	if (score >= 60) return '#eab308';
	return '#ef4444';
}

function renderMetric(label: string, value: string): string {
	return `<div class="analysis-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderList(items: string[] | undefined, empty: string): string {
	const values = items?.filter(Boolean) ?? [];
	if (values.length === 0) return `<p class="analysis-empty">${escapeHtml(empty)}</p>`;
	return `<ul class="analysis-list">${values.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderChips(items: string[] | undefined, empty: string): string {
	const values = items?.filter(Boolean) ?? [];
	if (values.length === 0) return `<span class="analysis-empty">${escapeHtml(empty)}</span>`;
	return values.map((item) => `<span class="analysis-chip">${escapeHtml(item)}</span>`).join('');
}

function renderLanguages(data: RepoAnalysisResponse): string {
	const languages = data.stack?.languages?.filter((language) => language.name) ?? [];
	if (languages.length === 0) return '<p class="analysis-empty">No se detectaron lenguajes.</p>';

	return languages
		.map((language) => {
			const percentage = Math.max(0, Math.min(100, language.percentage ?? 0));
			return `
				<div class="language-row">
					<div class="language-head">
						<span>${escapeHtml(language.name)}</span>
						<strong>${percentage}%</strong>
					</div>
					<div class="language-track"><span style="width: ${percentage}%"></span></div>
				</div>
			`;
		})
		.join('');
}

function renderDependencies(data: RepoAnalysisResponse): string {
	const dependencies = data.stack?.dependencies ?? {};
	const ecosystems = Object.entries(dependencies).filter(([, items]) => items.length > 0);
	if (ecosystems.length === 0) return '<p class="analysis-empty">No se encontraron dependencias en manifests conocidos.</p>';

	return ecosystems
		.map(([ecosystem, items]) => {
			const visible = items.slice(0, 12);
			const hiddenCount = Math.max(0, items.length - visible.length);
			return `
				<div class="dependency-group">
					<div class="dependency-head">
						<strong>${escapeHtml(ecosystem)}</strong>
						<span>${items.length} paquetes</span>
					</div>
					<div class="dependency-list">
						${visible
							.map(
								(item) => `
									<span class="dependency-pill">
										${escapeHtml(item.name)}
										<small>${escapeHtml(item.version ?? 'latest')}${item.isDev ? ' / dev' : ''}</small>
									</span>
								`,
							)
							.join('')}
						${hiddenCount > 0 ? `<span class="dependency-pill muted">+${hiddenCount} mas</span>` : ''}
					</div>
				</div>
			`;
		})
		.join('');
}

function renderVulnerabilities(data: RepoAnalysisResponse): string {
	const vulnerabilities = data.vulnerabilities ?? [];
	if (vulnerabilities.length === 0) {
		return `
			<div class="security-clean">
				<strong>Sin vulnerabilidades detectadas</strong>
				<span>El analisis no encontro advisories en las dependencias revisadas.</span>
			</div>
		`;
	}

	return vulnerabilities
		.map((item) => {
			const severity = (item.severity ?? 'unknown').toLowerCase();
			return `
				<article class="vulnerability-card severity-${escapeHtml(severity)}">
					<div class="vulnerability-head">
						<span>${escapeHtml(severity)}</span>
						<strong>${escapeHtml(item.id ?? item.package ?? 'Advisory')}</strong>
					</div>
					<p>${escapeHtml(item.summary ?? 'Sin descripcion disponible.')}</p>
					<div class="vulnerability-meta">
						<span>${escapeHtml(item.ecosystem ?? 'ecosistema')} / ${escapeHtml(item.package ?? 'paquete')}</span>
						<span>${escapeHtml(item.currentVersion ?? 'version actual')} -> ${escapeHtml(item.fixedVersion ?? 'sin fix')}</span>
					</div>
				</article>
			`;
		})
		.join('');
}

function renderCatalogMatches(data: RepoAnalysisResponse): string {
	const matches = data.catalogMatches ?? [];
	if (matches.length === 0) return '<p class="analysis-empty">Sin coincidencias con el catalogo local.</p>';

	return matches
		.map(
			(match) => `
				<a class="catalog-match" href="/librerias" title="Ver catalogo de librerias">
					<span>${escapeHtml(match.name ?? match.slug)}</span>
					<strong>${Math.round((match.matchScore ?? 0) * 100)}%</strong>
				</a>
			`,
		)
		.join('');
}

function renderResult(data: RepoAnalysisResponse): string {
	const repo = data.repo ?? {};
	const analysis = data.analysis ?? {};
	const structure = data.structure ?? {};
	const score = Math.max(0, Math.min(100, analysis.qualityScore ?? 0));
	const scoreColor = getScoreColor(score);
	const repoTitle = `${repo.owner ?? 'owner'}/${repo.name ?? 'repo'}`;

	return `
		<div class="analysis-topline">
			<div>
				<span class="section-tag">Reporte generado</span>
				<h2>${escapeHtml(repoTitle)}</h2>
				<p>${escapeHtml(repo.description ?? 'Repositorio analizado por StackDNA.')}</p>
			</div>
			<a class="analysis-open-link" href="${escapeHtml(repo.url ?? '#')}" target="_blank" rel="noreferrer">Abrir GitHub</a>
		</div>

		<div class="analysis-grid">
			<section class="analysis-panel score-panel">
				<div class="score-ring" style="--score: ${score}; --score-color: ${scoreColor}">
					<strong>${score}</strong>
					<span>/100</span>
				</div>
				<div>
					<h3>Calidad del repositorio</h3>
					<p>${escapeHtml(analysis.summary ?? 'Sin resumen disponible.')}</p>
					<div class="analysis-badges">
						<span>${data.cached ? 'Cache 24h' : 'Analisis nuevo'}</span>
						<span>${escapeHtml(formatDate(data.analyzedAt))}</span>
					</div>
				</div>
			</section>

			<section class="analysis-panel repo-panel">
				<h3>Metadata</h3>
				<div class="analysis-metrics">
					${renderMetric('Stars', formatNumber(repo.stars))}
					${renderMetric('Forks', formatNumber(repo.forks))}
					${renderMetric('Issues', formatNumber(repo.openIssues))}
					${renderMetric('Lenguaje', repo.language ?? 'Sin dato')}
					${renderMetric('Licencia', repo.license ?? 'Sin dato')}
					${renderMetric('Branch', repo.defaultBranch ?? 'Sin dato')}
				</div>
				<div class="analysis-chip-row">${renderChips(repo.topics, 'Sin topics')}</div>
			</section>

			<section class="analysis-panel wide-panel">
				<h3>Stack detectado</h3>
				<div class="stack-layout">
					<div>${renderLanguages(data)}</div>
					<div class="tech-summary">
						<h4>Frameworks</h4>
						<div class="analysis-chip-row">${renderChips(analysis.techStackSummary?.frameworks, 'Sin frameworks')}</div>
						<h4>Herramientas</h4>
						<div class="analysis-chip-row">${renderChips(analysis.techStackSummary?.tools, 'Sin herramientas')}</div>
						<h4>Patrones</h4>
						<div class="analysis-chip-row">${renderChips(analysis.techStackSummary?.patterns, 'Sin patrones')}</div>
					</div>
				</div>
			</section>

			<section class="analysis-panel wide-panel">
				<h3>Dependencias</h3>
				${renderDependencies(data)}
			</section>

			<section class="analysis-panel">
				<h3>Fortalezas</h3>
				${renderList(analysis.strengths, 'Sin fortalezas reportadas.')}
			</section>

			<section class="analysis-panel">
				<h3>Mejoras sugeridas</h3>
				${renderList(analysis.improvements, 'Sin mejoras reportadas.')}
			</section>

			<section class="analysis-panel wide-panel">
				<h3>Seguridad</h3>
				${renderVulnerabilities(data)}
				<div class="security-notes">
					<h4>Preocupaciones</h4>
					${renderList(analysis.securityConcerns, 'Sin preocupaciones adicionales.')}
				</div>
			</section>

			<section class="analysis-panel">
				<h3>Estructura</h3>
				<div class="analysis-metrics compact">
					${renderMetric('Archivos', formatNumber(structure.totalFiles))}
					${renderMetric('Tamano', `${formatNumber(repo.size)} KB`)}
					${renderMetric('Ultimo push', formatDate(repo.pushedAt))}
				</div>
				<h4>Archivos clave</h4>
				<div class="analysis-chip-row">${renderChips(structure.keyFiles, 'Sin archivos clave')}</div>
			</section>

			<section class="analysis-panel">
				<h3>Directorios</h3>
				<div class="directory-list">${renderChips(structure.directories?.slice(0, 24), 'Sin directorios')}</div>
			</section>

			<section class="analysis-panel wide-panel">
				<h3>Recomendaciones</h3>
				${renderList(analysis.recommendations, 'Sin recomendaciones reportadas.')}
			</section>

			<section class="analysis-panel">
				<h3>Catalogo StackDNA</h3>
				<div class="catalog-match-list">${renderCatalogMatches(data)}</div>
			</section>

			<section class="analysis-panel">
				<h3>Limite diario</h3>
				<div class="rate-limit">
					<strong>${formatNumber(data.rateLimit?.remaining)} de ${formatNumber(data.rateLimit?.limit)}</strong>
					<span>analisis disponibles hoy</span>
					<small>Reinicio: ${escapeHtml(formatDate(data.rateLimit?.resetAt))}</small>
				</div>
			</section>
		</div>
	`;
}

function setState(root: HTMLElement, state: 'idle' | 'loading' | 'error' | 'success'): void {
	const workbench = root.querySelector<HTMLElement>('[data-analysis-workbench]');
	const loading = root.querySelector<HTMLElement>('[data-analysis-loading]');
	const error = root.querySelector<HTMLElement>('[data-analysis-error]');
	const result = root.querySelector<HTMLElement>('[data-analysis-result]');

	if (workbench) workbench.hidden = state === 'idle';
	if (loading) loading.hidden = state !== 'loading';
	if (error) error.hidden = state !== 'error';
	if (result) result.hidden = state !== 'success';
}

export function initRepoAnalyzer(root?: HTMLElement): void {
	const app = root ?? document.querySelector<HTMLElement>('[data-repo-analyzer]');
	if (!app || app.dataset.repoAnalyzerBound === 'true') return;
	app.dataset.repoAnalyzerBound = 'true';

	const form = app.querySelector<HTMLFormElement>('[data-repo-form]');
	const input = app.querySelector<HTMLInputElement>('[data-repo-input]');
	const button = app.querySelector<HTMLButtonElement>('[data-repo-submit]');
	const result = app.querySelector<HTMLElement>('[data-analysis-result]');
	const errorText = app.querySelector<HTMLElement>('[data-analysis-error-text]');

	form?.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (!input || !result) return;

		const repoUrl = input.value.trim();
		if (!repoUrl) return;

		setState(app, 'loading');
		if (button) button.disabled = true;

		try {
			const response = await fetch(ENDPOINT, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ repoUrl }),
			});
			const data = (await response.json()) as RepoAnalysisResponse;

			if (!response.ok) {
				throw new Error(data.error ?? 'No se pudo analizar el repositorio.');
			}

			result.innerHTML = renderResult(data);
			setState(app, 'success');
			result.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} catch (error) {
			if (errorText) {
				errorText.textContent =
					error instanceof Error ? error.message : 'Error desconocido al conectar con el analizador.';
			}
			setState(app, 'error');
		} finally {
			if (button) button.disabled = false;
		}
	});
}
