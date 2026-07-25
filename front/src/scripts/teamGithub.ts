/**
 * Hidrata cada seccion de desarrollador con datos reales de la API publica
 * de GitHub (`GET https://api.github.com/users/{username}`).
 *
 * Solo se dispara para las tarjetas que tengan `data-github-username`
 * definido en `src/data/team.ts`. Si el campo esta vacio, la tarjeta se deja
 * tal cual (con los placeholders "pendiente") sin hacer ninguna peticion.
 *
 * Nota: la API publica de GitHub sin autenticacion tiene un limite de 60
 * requests/hora por IP. Si se supera, la tarjeta conserva su placeholder.
 */

interface GithubUserResponse {
	name: string | null;
	bio: string | null;
	avatar_url: string;
	html_url: string;
}

async function fetchGithubUser(username: string): Promise<GithubUserResponse | null> {
	try {
		const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username.trim())}`, {
			headers: { Accept: 'application/vnd.github+json' },
		});
		if (!response.ok) return null;
		return (await response.json()) as GithubUserResponse;
	} catch {
		return null;
	}
}

/**
 * GitHub sirve el avatar redimensionado con el parametro `s`. Pedimos una
 * version grande porque la foto se muestra a pantalla completa.
 */
function largeAvatarUrl(url: string, size = 900): string {
	try {
		const parsed = new URL(url);
		parsed.searchParams.set('s', String(size));
		return parsed.toString();
	} catch {
		return url;
	}
}

function applyUserToCard(card: HTMLElement, user: GithubUserResponse): void {
	const photo = card.querySelector<HTMLImageElement>('[data-dev-photo]');
	const placeholder = card.querySelector<HTMLElement>('[data-dev-photo-placeholder]');
	const nameEl = card.querySelector<HTMLElement>('[data-dev-name]');
	const bioEl = card.querySelector<HTMLElement>('[data-dev-bio]');
	const linkEl = card.querySelector<HTMLAnchorElement>('[data-dev-link]');

	// Se reutiliza el <img> renderizado por Astro (en lugar de crear uno nuevo)
	// para conservar los estilos con scope del componente.
	if (photo && user.avatar_url) {
		photo.src = largeAvatarUrl(user.avatar_url);
		photo.hidden = false;
		if (placeholder) placeholder.hidden = true;
	}

	if (nameEl && user.name) nameEl.textContent = user.name;
	if (bioEl && user.bio) bioEl.textContent = user.bio;
	if (linkEl) {
		linkEl.href = user.html_url;
		linkEl.hidden = false;
	}
}

export async function hydrateTeamFromGithub(): Promise<void> {
	if (typeof document === 'undefined') return;

	const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-developer-card][data-github-username]'));
	if (cards.length === 0) return;

	await Promise.all(
		cards.map(async (card) => {
			const username = card.dataset.githubUsername;
			if (!username) return;

			const user = await fetchGithubUser(username);
			if (user) applyUserToCard(card, user);
		}),
	);
}
