/**
 * In-memory store for URL mappings.
 * Exported as a module so both server and tests share the same interface.
 */

const links = new Map();

function addLink(code, originalUrl) {
  links.set(code, { originalUrl, createdAt: new Date().toISOString(), clicks: 0 });
}

function getLink(code) {
  return links.get(code) || null;
}

function incrementClicks(code) {
  const link = links.get(code);
  if (link) link.clicks++;
}

function getAllLinks() {
  return Array.from(links.entries()).map(([code, data]) => ({ code, ...data }));
}

function clear() {
  links.clear();
}

module.exports = { addLink, getLink, incrementClicks, getAllLinks, clear };
