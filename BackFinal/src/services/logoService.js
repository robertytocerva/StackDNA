function getLogoUrl(slug) {
  if (!slug) return null;
  return `https://cdn.simpleicons.org/${encodeURIComponent(slug)}`;
}

module.exports = { getLogoUrl };
