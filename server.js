const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { nanoid } = require('nanoid');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Initialize SQLite database
const db = new sqlite3.Database('./urls.db', (err) => {
  if (err) console.error(err);
  else console.log('Connected to SQLite database');
});

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id TEXT PRIMARY KEY,
    originalUrl TEXT NOT NULL,
    shortCode TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    clicks INTEGER DEFAULT 0
  )
`);

// Routes

// Create a short URL
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

  const shortCode = nanoid(7);
  const id = nanoid();

  db.run(
    'INSERT INTO urls (id, originalUrl, shortCode) VALUES (?, ?, ?)',
    [id, url, shortCode],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create short URL' });
      }
      res.json({
        originalUrl: url,
        shortCode,
        shortUrl: `http://localhost:${PORT}/s/${shortCode}`
      });
    }
  );
});

// Get URL and redirect
app.get('/s/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.run(
    'UPDATE urls SET clicks = clicks + 1 WHERE shortCode = ?',
    [shortCode],
    function (err) {
      if (err) console.error(err);
    }
  );

  db.get('SELECT originalUrl FROM urls WHERE shortCode = ?', [shortCode], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    res.redirect(row.originalUrl);
  });
});

// Get URL stats
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get(
    'SELECT originalUrl, createdAt, clicks FROM urls WHERE shortCode = ?',
    [shortCode],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Short URL not found' });
      }
      res.json({
        shortCode,
        originalUrl: row.originalUrl,
        createdAt: row.createdAt,
        clicks: row.clicks
      });
    }
  );
});

// Get all URLs
app.get('/api/urls', (req, res) => {
  db.all(
    'SELECT shortCode, originalUrl, createdAt, clicks FROM urls ORDER BY createdAt DESC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch URLs' });
      }
      res.json(rows || []);
    }
  );
});

// Delete a short URL
app.delete('/api/urls/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.run('DELETE FROM urls WHERE shortCode = ?', [shortCode], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete URL' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    res.json({ success: true });
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
