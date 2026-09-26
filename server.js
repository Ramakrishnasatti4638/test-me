import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      short_code TEXT UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      clicks INTEGER DEFAULT 0
    )
  `);
});

// API Routes

// Shorten a URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = nanoid(6);

  db.run(
    'INSERT INTO urls (short_code, original_url) VALUES (?, ?)',
    [shortCode, url],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to shorten URL' });
      }

      res.json({
        shortCode,
        shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
        originalUrl: url
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
      if (err || !row) {
        return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
      }

      // Increment click count
      db.run('UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?', [shortCode]);

      res.redirect(row.original_url);
    }
  );
});

// Get URL stats
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get(
    'SELECT short_code, original_url, created_at, clicks FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      res.json(row);
    }
  );
});

// Serve index.html for SPA routing
app.get('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`URL Shortener app listening at http://localhost:${PORT}`);
});
