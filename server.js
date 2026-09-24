const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const shortId = require('shortid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id TEXT PRIMARY KEY,
      originalUrl TEXT NOT NULL,
      shortCode TEXT NOT NULL UNIQUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Helper functions
const generateShortCode = () => shortId.generate().substring(0, 8);

// API Routes
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

  const id = generateShortCode();
  db.run(
    'INSERT INTO urls (id, originalUrl, shortCode) VALUES (?, ?, ?)',
    [id, url, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create short URL' });
      }
      res.json({ 
        shortCode: id, 
        shortUrl: `http://localhost:${PORT}/${id}`,
        originalUrl: url
      });
    }
  );
});

app.get('/api/urls/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  db.get(
    'SELECT * FROM urls WHERE shortCode = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'URL not found' });
      }
      res.json(row);
    }
  );
});

// Redirect route - the key route for redirect testing
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  // Skip static file requests
  if (shortCode === 'favicon.ico' || shortCode.includes('.')) {
    return res.status(404).send('Not found');
  }
  
  db.get(
    'SELECT * FROM urls WHERE shortCode = ?',
    [shortCode],
    (err, row) => {
      if (err || !row) {
        return res.status(404).send('Short URL not found');
      }
      res.redirect(301, row.originalUrl);
    }
  );
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`URL Shortener app running on http://localhost:${PORT}`);
});

module.exports = { app, db, server };
