const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'urls.db'));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    slug      TEXT UNIQUE NOT NULL,
    originalUrl TEXT NOT NULL,
    clicks    INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL
  )
`);

module.exports = {
  create(slug, originalUrl) {
    const createdAt = new Date().toISOString();
    db.prepare('INSERT INTO urls (slug, originalUrl, createdAt) VALUES (?, ?, ?)').run(slug, originalUrl, createdAt);
    return { slug, originalUrl, clicks: 0, createdAt };
  },

  getBySlug(slug) {
    return db.prepare('SELECT * FROM urls WHERE slug = ?').get(slug) || null;
  },

  getAll() {
    return db.prepare('SELECT * FROM urls ORDER BY id DESC').all();
  },

  incrementClicks(slug) {
    db.prepare('UPDATE urls SET clicks = clicks + 1 WHERE slug = ?').run(slug);
  },

  remove(slug) {
    const result = db.prepare('DELETE FROM urls WHERE slug = ?').run(slug);
    return result.changes > 0;
  }
};
