// In-memory URL store
const urlMap = new Map();

function save(code, originalUrl) {
  urlMap.set(code, { originalUrl, createdAt: Date.now(), clicks: 0 });
}

function find(code) {
  return urlMap.get(code) || null;
}

function incrementClicks(code) {
  const entry = urlMap.get(code);
  if (entry) entry.clicks += 1;
}

function all() {
  return [...urlMap.entries()].map(([code, data]) => ({ code, ...data }));
}

function clear() {
  urlMap.clear();
}

module.exports = { save, find, incrementClicks, all, clear };
