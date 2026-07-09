// In-memory store for shortened URLs
const links = new Map();

function generateCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function createLink(originalUrl, customAlias) {
  let shortCode = customAlias || generateCode();

  // Ensure generated code is unique
  if (!customAlias) {
    while (links.has(shortCode)) {
      shortCode = generateCode();
    }
  }

  const entry = {
    shortCode,
    originalUrl,
    createdAt: new Date().toISOString(),
    clickCount: 0,
  };
  links.set(shortCode, entry);
  return entry;
}

function getLink(shortCode) {
  return links.get(shortCode) || null;
}

function getAllLinks() {
  return Array.from(links.values()).sort((a, b) => b.clickCount - a.clickCount);
}

function incrementClick(shortCode) {
  const entry = links.get(shortCode);
  if (entry) entry.clickCount++;
}

function deleteLink(shortCode) {
  return links.delete(shortCode);
}

function hasCode(shortCode) {
  return links.has(shortCode);
}

function clear() {
  links.clear();
}

module.exports = { isValidUrl, createLink, getLink, getAllLinks, incrementClick, deleteLink, hasCode, clear };
