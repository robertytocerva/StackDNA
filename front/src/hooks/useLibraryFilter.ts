import type { LibraryCategory, LibraryEntry } from '../data/libraries';

export interface LibraryFilterResult {
	filteredData: LibraryEntry[];
	totalResults: number;
	availableLanguages: string[];
	availableCategories: LibraryCategory[];
}

export function useLibraryFilter(
	data: LibraryEntry[],
	searchTerm = '',
	selectedLanguage = 'all',
	selectedCategory: LibraryCategory | 'all' = 'all',
): LibraryFilterResult {
	const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

	// Mantener las opciones disponibles basadas en el dataset completo.
	const availableLanguages = Array.from(new Set(data.map((item) => item.language)));
	const availableCategories = Array.from(new Set(data.map((item) => item.library.category)));

	const filteredData = data.filter((item) => {
		// La búsqueda cubre nombre de librería, lenguaje y descripción.
		const searchableText = [
			item.library.name,
			item.language,
			item.library.description,
		].join(' ').toLocaleLowerCase();
		const matchesSearch = normalizedSearch === '' || searchableText.includes(normalizedSearch);

		// El filtro de lenguaje se omite cuando la opción es "all".
		const matchesLanguage = selectedLanguage === 'all' || item.language === selectedLanguage;

		// El filtro de categoría se omite cuando la opción es "all".
		const matchesCategory = selectedCategory === 'all' || item.library.category === selectedCategory;

		return matchesSearch && matchesLanguage && matchesCategory;
	});

	return {
		filteredData,
		totalResults: filteredData.length,
		availableLanguages,
		availableCategories,
	};
}
