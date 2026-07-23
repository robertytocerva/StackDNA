/**
 * Generates a URL-safe slug from a technology name.
 * - Converts to lowercase
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes consecutive hyphens
 * - Trims leading/trailing hyphens
 * - Limits to 100 characters
 */
export function generateSlug(nombre: string): string {
  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')    // Replace non-alphanumeric with hyphens
    .replace(/-{2,}/g, '-')          // Remove consecutive hyphens
    .replace(/^-|-$/g, '')           // Trim leading/trailing hyphens
    .slice(0, 100);                  // Limit to 100 chars

  return slug || 'unnamed';
}

/**
 * Resolves slug collisions by appending a numeric suffix.
 * Given existing slugs, finds the next available suffix.
 */
export function resolveSlugCollision(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (true) {
    const candidate = `${baseSlug}-${counter}`;
    if (!existingSlugs.includes(candidate)) {
      return candidate;
    }
    counter++;
  }
}
