import {
	createServiceState,
	getDefaultRequestJson,
	initialServices,
	type ApiServiceState,
	type HttpMethod,
	type ResponseType,
	type ServiceDefinition,
} from '../data/services';

type MethodFilter = HttpMethod | 'ALL';

type ApiTesterState = {
	services: ApiServiceState[];
	filters: {
		method: MethodFilter;
		service: string;
	};
};

type RequestConfig = {
	method?: string;
	url?: string;
	body?: unknown;
	[key: string]: unknown;
};

const RESPONSE_PLACEHOLDER = '/* La respuesta simulada aparecerá aquí... */';
const METHODS: MethodFilter[] = ['ALL', 'GET', 'POST', 'PUT', 'DELETE'];

function createInitialState(): ApiTesterState {
	return {
		services: initialServices.map((service) => createServiceState(service)),
		filters: {
			method: 'ALL',
			service: 'ALL',
		},
	};
}

function isMethodFilter(value: string | undefined): value is MethodFilter {
	return Boolean(value && METHODS.includes(value as MethodFilter));
}

function getService(state: ApiTesterState, id: string): ApiServiceState | undefined {
	return state.services.find((service) => service.id === id);
}

function getCard(root: HTMLElement, id: string): HTMLElement | undefined {
	return Array.from(root.querySelectorAll<HTMLElement>('[data-api-card]')).find(
		(card) => card.dataset.serviceId === id,
	);
}

function getFilteredServices(state: ApiTesterState): ApiServiceState[] {
	return state.services.filter((service) => {
		const methodMatches = state.filters.method === 'ALL' || service.method === state.filters.method;
		const serviceMatches = state.filters.service === 'ALL' || service.name === state.filters.service;
		return methodMatches && serviceMatches;
	});
}

function updateResponseBox(card: HTMLElement, service: ApiServiceState): void {
	const responseBox = card.querySelector<HTMLElement>('[data-response-box]');
	if (!responseBox) return;

	responseBox.classList.remove('success', 'error', 'loading');
	if (service.isLoading) {
		responseBox.classList.add('loading');
		responseBox.textContent = 'Enviando petición...';
	} else {
		if (service.responseType) responseBox.classList.add(service.responseType);
		responseBox.textContent = service.response ?? RESPONSE_PLACEHOLDER;
	}
	responseBox.setAttribute('aria-busy', String(service.isLoading));
}

function updateFilterUi(
	root: HTMLElement,
	state: ApiTesterState,
	filteredServices: ApiServiceState[],
): void {
	root.querySelectorAll<HTMLButtonElement>('[data-method-filter]').forEach((button) => {
		const isActive = button.dataset.methodFilter === state.filters.method;
		button.classList.toggle('active', isActive);
		button.setAttribute('aria-pressed', String(isActive));
	});

	const serviceFilter = root.querySelector<HTMLSelectElement>('[data-service-filter]');
	if (serviceFilter && serviceFilter.value !== state.filters.service) {
		serviceFilter.value = state.filters.service;
	}

	const resultLabel = filteredServices.length === 1 ? 'servicio visible' : 'servicios visibles';
	const status = root.querySelector<HTMLElement>('[data-filter-status]');
	if (status) status.textContent = `${filteredServices.length} ${resultLabel}`;

	const visibleCount = root.querySelector<HTMLElement>('[data-visible-count]');
	if (visibleCount) visibleCount.textContent = `${filteredServices.length} ${resultLabel}`;
}

function renderGrid(root: HTMLElement, state: ApiTesterState): void {
	const filteredServices = getFilteredServices(state);
	const visibleIds = new Set(filteredServices.map((service) => service.id));

	root.querySelectorAll<HTMLElement>('[data-api-card]').forEach((card) => {
		card.hidden = !visibleIds.has(card.dataset.serviceId ?? '');
	});

	const emptyState = root.querySelector<HTMLElement>('[data-empty-state]');
	if (emptyState) emptyState.hidden = filteredServices.length !== 0;

	updateFilterUi(root, state, filteredServices);
}

function renderServiceFilter(root: HTMLElement, state: ApiTesterState): void {
	const select = root.querySelector<HTMLSelectElement>('[data-service-filter]');
	if (!select) return;

	const currentValue = state.filters.service;
	const names = [...new Set(state.services.map((service) => service.name))].sort((a, b) => a.localeCompare(b));
	select.replaceChildren();

	const allOption = document.createElement('option');
	allOption.value = 'ALL';
	allOption.textContent = 'TODOS LOS SERVICIOS';
	select.appendChild(allOption);

	names.forEach((name) => {
		const option = document.createElement('option');
		option.value = name;
		option.textContent = name;
		select.appendChild(option);
	});

	state.filters.service = names.includes(currentValue) ? currentValue : 'ALL';
	select.value = state.filters.service;
}

function hydrateCard(card: HTMLElement, service: ApiServiceState): void {
	card.id = `card-${service.id}`;
	card.dataset.serviceId = service.id;
	card.dataset.serviceName = service.name;
	card.dataset.method = service.method;
	delete card.dataset.templateCard;

	const nameLabel = card.querySelector<HTMLElement>('[data-service-name-label]');
	if (nameLabel) nameLabel.textContent = service.name;

	const methodBadge = card.querySelector<HTMLElement>('[data-method-badge]');
	if (methodBadge) methodBadge.textContent = service.method;

	const url = card.querySelector<HTMLElement>('[data-service-url]');
	if (url) url.textContent = service.url;

	const editor = card.querySelector<HTMLTextAreaElement>('[data-service-editor]');
	if (editor) {
		editor.id = `editor-${service.id}`;
		editor.value = service.editorContent;
		editor.setAttribute('aria-label', `Payload JSON para ${service.name}`);
		const label = card.querySelector<HTMLLabelElement>('.api-field-heading label');
		if (label) label.htmlFor = editor.id;
	}

	const responseBox = card.querySelector<HTMLElement>('[data-response-box]');
	if (responseBox) {
		responseBox.id = `res-${service.id}`;
		responseBox.setAttribute('aria-label', `Respuesta de ${service.name}`);
	}

	const deleteButton = card.querySelector<HTMLButtonElement>('[data-delete-service]');
	if (deleteButton) deleteButton.setAttribute('aria-label', `Eliminar servicio ${service.name}`);

	updateResponseBox(card, service);
}

function appendServiceCard(root: HTMLElement, service: ApiServiceState): HTMLElement | undefined {
	const grid = root.querySelector<HTMLElement>('[data-api-grid]');
	const template = root.querySelector<HTMLTemplateElement>('[data-api-card-template]');
	if (!grid || !template) return undefined;

	const fragment = template.content.cloneNode(true) as DocumentFragment;
	const card = fragment.querySelector<HTMLElement>('[data-api-card]');
	if (!card) return undefined;

	hydrateCard(card, service);
	const emptyState = grid.querySelector<HTMLElement>('[data-empty-state]');
	grid.insertBefore(fragment, emptyState ?? template);
	return getCard(root, service.id);
}

function removeService(root: HTMLElement, state: ApiTesterState, id: string): void {
	state.services = state.services.filter((service) => service.id !== id);
	getCard(root, id)?.remove();
	renderServiceFilter(root, state);
	renderGrid(root, state);
}

function resetEditor(root: HTMLElement, state: ApiTesterState, id: string): void {
	const service = getService(state, id);
	const card = getCard(root, id);
	if (!service || !card) return;

	service.editorContent = getDefaultRequestJson(service);
	const editor = card.querySelector<HTMLTextAreaElement>('[data-service-editor]');
	if (editor) editor.value = service.editorContent;
}

function parseRequest(value: string): RequestConfig {
	const parsed: unknown = JSON.parse(value);
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error('El payload debe ser un objeto JSON válido.');
	}
	return parsed as RequestConfig;
}

function wait(milliseconds: number): Promise<void> {
	return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function sendRequest(root: HTMLElement, state: ApiTesterState, id: string): Promise<void> {

	const service = getService(state, id);
	const card = getCard(root, id);
	const editor = card?.querySelector<HTMLTextAreaElement>("[data-service-editor]");
	const sendButton = card?.querySelector<HTMLButtonElement>("[data-send-request]");

	if (!service || !card || !editor) return;

	service.editorContent = editor.value;
	service.response = null;
	service.responseType = null;
	service.isLoading = true;

	if (sendButton) sendButton.disabled = true;

	updateResponseBox(card, service);

	try {

		const payload = parseRequest(editor.value);

		const response = await fetch("http://localhost:3000/execute", {

			method: "POST",

			headers: {

				"Content-Type": "application/json"

			},

			body: JSON.stringify(payload)

		});

		const data = await response.json();

		service.response = JSON.stringify(data, null, 2);

		service.responseType = response.ok ? "success" : "error";

	}
	catch (error) {

		service.response =
			error instanceof Error
				? error.message
				: "Error desconocido";

		service.responseType = "error";

	}
	finally {

		service.isLoading = false;

		if (sendButton) sendButton.disabled = false;

		updateResponseBox(card, service);

	}

}

function createCustomService(state: ApiTesterState): ApiServiceState {
	const baseId = `s_${Date.now()}`;
	let id = baseId;
	let suffix = 1;
	while (state.services.some((service) => service.id === id)) {
		id = `${baseId}_${suffix}`;
		suffix += 1;
	}

	const definition: ServiceDefinition = {
		id,
		name: 'Custom AWS Service',
		method: 'GET',
		url: 'https://your-api-id.execute-api.region.amazonaws.com/stage',
	};
	return createServiceState(definition);
}

function bindFilters(root: HTMLElement, state: ApiTesterState): void {
	const filters = root.querySelector<HTMLElement>('[data-api-filters]');
	if (!filters) return;

	filters.addEventListener('click', (event) => {
		if (!(event.target instanceof Element)) return;
		const methodButton = event.target.closest<HTMLButtonElement>('[data-method-filter]');
		if (methodButton) {
			const method = methodButton.dataset.methodFilter;
			if (isMethodFilter(method)) {
				state.filters.method = method;
				renderGrid(root, state);
			}
			return;
		}

		const addButton = event.target.closest<HTMLButtonElement>('[data-add-service]');
		if (addButton) {
			const service = createCustomService(state);
			state.services.push(service);
			renderServiceFilter(root, state);
			const card = appendServiceCard(root, service);
			renderGrid(root, state);
			card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	});

	const select = filters.querySelector<HTMLSelectElement>('[data-service-filter]');
	select?.addEventListener('change', () => {
		state.filters.service = select.value;
		renderGrid(root, state);
	});
}

function bindGrid(root: HTMLElement, state: ApiTesterState): void {
	const grid = root.querySelector<HTMLElement>('[data-api-grid]');
	if (!grid) return;

	grid.addEventListener('input', (event) => {
		if (!(event.target instanceof HTMLTextAreaElement)) return;
		if (!event.target.matches('[data-service-editor]')) return;

		const card = event.target.closest<HTMLElement>('[data-api-card]');
		const id = card?.dataset.serviceId;
		const service = id ? getService(state, id) : undefined;
		if (service) service.editorContent = event.target.value;
	});

	grid.addEventListener('click', (event) => {
		if (!(event.target instanceof Element)) return;
		const button = event.target.closest<HTMLButtonElement>('button');
		const card = button?.closest<HTMLElement>('[data-api-card]');
		const id = card?.dataset.serviceId;
		if (!button || !id) return;

		if (button.matches('[data-delete-service]')) {
			removeService(root, state, id);
		} else if (button.matches('[data-reset-editor]')) {
			resetEditor(root, state, id);
		} else if (button.matches('[data-send-request]')) {
			void sendRequest(root, state, id);
		}
	});
}

export function initApiTester(root?: HTMLElement): void {
	const app = root ?? document.querySelector<HTMLElement>('[data-api-tester]');
	if (!app || app.dataset.apiTesterBound === 'true') return;
	app.dataset.apiTesterBound = 'true';

	const state = createInitialState();
	bindFilters(app, state);
	bindGrid(app, state);
	renderServiceFilter(app, state);
	renderGrid(app, state);
}
