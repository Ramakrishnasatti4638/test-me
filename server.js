const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./urls.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database.');
});

db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id TEXT PRIMARY KEY,
    short_code TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    clicks INTEGER DEFAULT 0
  )
`);

// API Routes

// Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const id = uuidv4();
  const shortCode = id.substring(0, 6).toUpperCase();

  db.run(
    'INSERT INTO urls (id, short_code, original_url) VALUES (?, ?, ?)',
    [id, shortCode, url],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create short URL' });
      }
      res.json({
        short_code: shortCode,
        original_url: url,
        short_url: `http://localhost:3000/${shortCode}`
      });
    }
  );
});

// Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get(
    'SELECT original_url FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      // Increment click count
      db.run('UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?', [shortCode]);

      res.redirect(row.original_url);
    }
  );
});

// Get all URLs (for stats)
app.get('/api/urls/list', (req, res) => {
  db.all(
    'SELECT short_code, original_url, clicks, created_at FROM urls ORDER BY created_at DESC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows || []);
    }
  );
});

// Get stats for a specific short code
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get(
    'SELECT short_code, original_url, clicks, created_at FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Short URL not found' });
      }
      res.json(row);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
