/**
 * Datos del equipo de desarrollo.
 *
 * Estos campos estan pensados para ser completados con la respuesta de la
 * API de GitHub (`GET https://api.github.com/users/{username}`):
 *   - githubUsername -> input para el fetch
 *   - name           <- data.name
 *   - avatarUrl      <- data.avatar_url
 *   - bio            <- data.bio
 *   - profileUrl     <- data.html_url
 *
 * `role` es informacion propia del sitio (no viene de GitHub) y debe
 * mantenerse aunque se hidrate el resto con la API.
 */
export interface DeveloperEntry {
	id: string;
	githubUsername: string;
	name: string;
	role: string;
	bio: string;
	avatarUrl: string | null;
	profileUrl: string | null;
}

export const developers: DeveloperEntry[] = [
	{
		id: 'dev-1',
		githubUsername: 'ElDeivid10',
		name: '',
		role: 'Desarrollador FrontEnd con Astro.js',
		bio: '',
		avatarUrl: null,
		profileUrl: null,
	},
	{
		id: 'dev-2',
		githubUsername: 'robertytocerva',
		name: '',
		role: 'Desarrollador BackEnd con Node.js',
		bio: '',
		avatarUrl: null,
		profileUrl: null,
	},
	{
		id: 'dev-3',
		githubUsername: 'gustavocalderon067 ',
		name: '',
		role: 'Desarrollador FrontEnd con Astro.js',
		bio: '',
		avatarUrl: null,
		profileUrl: null,
	},
	{
		id: 'dev-4',
		githubUsername: 'ErickRodriguezR',
		name: '',
		role: 'Desarrollador BackEnd con Node.js',
		bio: '',
		avatarUrl: null,
		profileUrl: null,
	},
	{
		id: 'dev-5',
		githubUsername: 'pazangel',
		name: '',
		role: 'Desarrollador BackEnd con Node.js',
		bio: '',
		avatarUrl: null,
		profileUrl: null,
	},
];
