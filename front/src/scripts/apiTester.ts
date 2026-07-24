const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3001';

function setResponse(responseBox: HTMLElement, payload: unknown, state: 'success' | 'error' | 'loading'): void {
	responseBox.className = `response-box api-response-box ${state}`;
	responseBox.textContent = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
}

function applyFilters(root: HTMLElement): void {
	const query = root.querySelector<HTMLInputElement>('#search-service')?.value.trim().toLowerCase() || '';
	const method = root.querySelector<HTMLButtonElement>('[data-filter].active')?.dataset.filter || 'ALL';
	const cards = root.querySelectorAll<HTMLElement>('[data-service-id]');
	let visible = 0;

	cards.forEach((card) => {
		const name = card.querySelector<HTMLElement>('.service-name')?.textContent?.toLowerCase() || '';
		const methodMatches = method === 'ALL' || card.dataset.method === method;
		const nameMatches = name.includes(query);
		const isVisible = methodMatches && nameMatches;
		card.hidden = !isVisible;
		if (isVisible) visible += 1;
	});

	const count = root.querySelector<HTMLElement>('[data-visible-count]');
	if (count) count.textContent = `${visible} ${visible === 1 ? 'servicio visible' : 'servicios visibles'}`;

	const emptyState = root.querySelector<HTMLElement>('[data-empty-state]');
	if (emptyState) emptyState.hidden = visible !== 0;
}

function parsePayload(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		throw new Error('El payload no es un JSON válido');
	}
}

function bindFilters(root: HTMLElement): void {
	const searchInput = root.querySelector<HTMLInputElement>('#search-service');
	searchInput?.addEventListener('input', () => {
		root.dispatchEvent(new CustomEvent('api-filter-change'));
	});

	root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => {
		button.addEventListener('click', () => {
			root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((item) => {
				const active = item === button;
				item.classList.toggle('active', active);
				item.setAttribute('aria-pressed', String(active));
			});
			root.dispatchEvent(new CustomEvent('api-filter-change', { detail: { method: button.dataset.filter } }));
		});
	});

	root.addEventListener('api-filter-change', () => applyFilters(root));
}

function bindRequests(root: HTMLElement): void {
	root.querySelectorAll<HTMLButtonElement>('.btn-ejecutar').forEach((button) => {
		button.addEventListener('click', async () => {
			const card = button.closest<HTMLElement>('[data-service-id]');
			const textarea = card?.querySelector<HTMLTextAreaElement>('.payload-editor');
			const responseBox = card?.querySelector<HTMLElement>('.response-box');
			if (!card || !textarea || !responseBox) return;

			let payload: unknown;
			try {
				payload = parsePayload(textarea.value);
			} catch (error) {
				setResponse(responseBox, {
					status: 400,
					error: 'JSON inválido',
					message: error instanceof Error ? error.message : 'El payload no es un JSON válido',
				}, 'error');
				return;
			}

			button.disabled = true;
			button.textContent = 'Cargando...';
			setResponse(responseBox, 'Ejecutando petición...', 'loading');

			try {
				const response = await fetch(`${BACKEND_URL}/api/aws/call`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});
				const data: unknown = await response.json();
				setResponse(responseBox, data, response.ok ? 'success' : 'error');
			} catch {
				setResponse(responseBox, {
					status: 500,
					error: 'Error de red',
					message: 'No se pudo conectar con el backend',
				}, 'error');
			} finally {
				button.disabled = false;
				button.textContent = '▶ EJECUTAR PETICIÓN';
			}
		});
	});
}

export function initApiTester(root?: HTMLElement): void {
	const app = root ?? document.querySelector<HTMLElement>('[data-api-tester]');
	if (!app || app.dataset.apiTesterBound === 'true') return;
	app.dataset.apiTesterBound = 'true';
	bindFilters(app);
	bindRequests(app);
	applyFilters(app);
}
