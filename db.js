'use strict';

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(path.join(DATA_DIR, 'shortener.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_clicked_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);
`);

function isValidCode(code) {
  return /^[A-Za-z0-9_-]{1,32}$/.test(code);
}

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function randomCode(length = 6) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  const bytes = require('crypto').randomBytes(length);
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

function createUniqueCode(length = 6, maxAttempts = 8) {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = randomCode(length);
    const existing = db.prepare('SELECT 1 FROM links WHERE code = ?').get(candidate);
    if (!existing) return candidate;
    length = Math.min(length + 1, 16);
  }
  throw new Error('Could not generate a unique short code');
}

module.exports = {
  db,
  isValidCode,
  isValidUrl,
  createUniqueCode,
};