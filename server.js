const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database
const db = new sqlite3.Database('./urls.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shortCode TEXT UNIQUE NOT NULL,
    originalUrl TEXT NOT NULL,
    shortUrl TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Helper function to generate short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// API Routes

// Create shortened URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'Invalid URL provided' });
  }

  let shortCode = generateShortCode();
  const shortUrl = `http://localhost:5000/s/${shortCode}`;

  // Check if short code already exists (unlikely, but handle it)
  const checkQuery = 'SELECT id FROM urls WHERE shortCode = ?';
  db.get(checkQuery, [shortCode], (err, row) => {
    if (row) {
      // Try again with a new code
      shortCode = generateShortCode();
    }

    const query = `
      INSERT INTO urls (shortCode, originalUrl, shortUrl)
      VALUES (?, ?, ?)
    `;

    db.run(query, [shortCode, url.trim(), shortUrl], function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create short URL' });
      }

      res.status(201).json({
        id: this.lastID,
        shortCode,
        originalUrl: url.trim(),
        shortUrl,
        clicks: 0,
        createdAt: new Date().toISOString()
      });
    });
  });
});

// Get all URLs
app.get('/api/urls', (req, res) => {
  const query = 'SELECT * FROM urls ORDER BY createdAt DESC';
  db.all(query, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch URLs' });
    }
    res.json(rows || []);
  });
});

// Get URL stats
app.get('/api/urls/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const query = 'SELECT * FROM urls WHERE shortCode = ?';

  db.get(query, [shortCode], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch URL' });
    }
    if (!row) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json(row);
  });
});

// Redirect to original URL
app.get('/s/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const query = 'SELECT * FROM urls WHERE shortCode = ?';

  db.get(query, [shortCode], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).send('Short URL not found');
    }

    // Increment click count
    const updateQuery = 'UPDATE urls SET clicks = clicks + 1 WHERE shortCode = ?';
    db.run(updateQuery, [shortCode]);

    // Redirect to original URL
    res.redirect(row.originalUrl);
  });
});

// Delete URL
app.delete('/api/urls/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const query = 'DELETE FROM urls WHERE shortCode = ?';

  db.run(query, [shortCode], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete URL' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json({ message: 'URL deleted successfully' });
  });
});

// Serve React app in production
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
