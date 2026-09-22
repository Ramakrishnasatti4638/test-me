import express from 'express';
import sqlite3 from 'sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'urls.db'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id TEXT PRIMARY KEY,
      originalUrl TEXT NOT NULL,
      shortCode TEXT NOT NULL UNIQUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      clicks INTEGER DEFAULT 0
    )
  `);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes

// Create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Simple URL validation
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = nanoid(7);
  const id = nanoid();

  db.run(
    'INSERT INTO urls (id, originalUrl, shortCode) VALUES (?, ?, ?)',
    [id, url, shortCode],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create short URL' });
      }
      res.json({ shortCode, shortUrl: `http://localhost:3000/s/${shortCode}` });
    }
  );
});

// Get all URLs (admin)
app.get('/api/urls', (req, res) => {
  db.all('SELECT * FROM urls ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Redirect to original URL
app.get('/s/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get('SELECT originalUrl, id FROM urls WHERE shortCode = ?', [shortCode], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Increment clicks
    db.run('UPDATE urls SET clicks = clicks + 1 WHERE shortCode = ?', [shortCode]);

    res.redirect(row.originalUrl);
  });
});

// Delete a short URL
app.delete('/api/urls/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.run('DELETE FROM urls WHERE shortCode = ?', [shortCode], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json({ message: 'Deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
