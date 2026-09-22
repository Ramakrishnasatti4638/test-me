const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
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

// Helper function to generate short code
function generateShortCode() {
  return uuidv4().substring(0, 8);
}

// API Routes

// POST /api/shorten - Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = generateShortCode();

  db.run(
    'INSERT INTO urls (short_code, original_url) VALUES (?, ?)',
    [shortCode, url],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create shortened URL' });
      }

      res.json({
        short_code: shortCode,
        short_url: `http://localhost:${PORT}/${shortCode}`,
        original_url: url
      });
    }
  );
});

// GET /:shortCode - Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  // Skip API routes and static files
  if (shortCode.startsWith('api') || shortCode.includes('.')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }

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

// GET /api/stats/:shortCode - Get click statistics
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get(
    'SELECT short_code, original_url, created_at, clicks FROM urls WHERE short_code = ?',
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

// GET /api/all - Get all shortened URLs
app.get('/api/all', (req, res) => {
  db.all(
    'SELECT short_code, original_url, created_at, clicks FROM urls ORDER BY created_at DESC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(rows || []);
    }
  );
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`URL Shortener running at http://localhost:${PORT}`);
});
