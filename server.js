const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'urls.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id TEXT PRIMARY KEY,
      shortCode TEXT UNIQUE NOT NULL,
      originalUrl TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      clicks INTEGER DEFAULT 0
    )
  `, (err) => {
    if (err) console.error('Error creating table:', err);
  });
}

// Generate short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// API Routes

// Create shortened URL
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
  const shortCode = generateShortCode();

  db.run(
    'INSERT INTO urls (id, shortCode, originalUrl) VALUES (?, ?, ?)',
    [id, shortCode, url],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Short code already exists, please try again' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        id,
        shortCode,
        originalUrl: url,
        shortUrl: `http://localhost:5000/${shortCode}`,
        createdAt: new Date().toISOString(),
        clicks: 0
      });
    }
  );
});

// Get URL details and redirect
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.run(
    'UPDATE urls SET clicks = clicks + 1 WHERE shortCode = ?',
    [shortCode],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
    }
  );

  db.get(
    'SELECT originalUrl FROM urls WHERE shortCode = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      res.redirect(row.originalUrl);
    }
  );
});

// Get stats for a short URL
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get(
    'SELECT * FROM urls WHERE shortCode = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      res.json({
        id: row.id,
        shortCode: row.shortCode,
        originalUrl: row.originalUrl,
        shortUrl: `http://localhost:5000/${row.shortCode}`,
        createdAt: row.createdAt,
        clicks: row.clicks
      });
    }
  );
});

// Get all URLs
app.get('/api/urls', (req, res) => {
  db.all(
    'SELECT * FROM urls ORDER BY createdAt DESC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const urls = rows.map(row => ({
        id: row.id,
        shortCode: row.shortCode,
        originalUrl: row.originalUrl,
        shortUrl: `http://localhost:5000/${row.shortCode}`,
        createdAt: row.createdAt,
        clicks: row.clicks
      }));

      res.json(urls);
    }
  );
});

// Delete a shortened URL
app.delete('/api/urls/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.run(
    'DELETE FROM urls WHERE shortCode = ?',
    [shortCode],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      res.json({ success: true });
    }
  );
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
