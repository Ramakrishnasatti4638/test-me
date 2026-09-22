const express = require('express');
const sqlite3 = require('sqlite3');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE urls (
      id TEXT PRIMARY KEY,
      original_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      clicks INTEGER DEFAULT 0
    )
  `);
});

// Helper function to run queries with promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Routes

// Create a short URL
app.post('/api/shorten', async (req, res) => {
  try {
    const { url } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Generate short ID
    const shortId = nanoid(6);

    // Save to database
    await dbRun(
      'INSERT INTO urls (id, original_url) VALUES (?, ?)',
      [shortId, url]
    );

    res.json({
      shortUrl: `http://localhost:${PORT}/${shortId}`,
      shortId,
      originalUrl: url
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create short URL' });
  }
});

// Redirect to original URL
app.get('/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;

    const row = await dbGet(
      'SELECT original_url, clicks FROM urls WHERE id = ?',
      [shortId]
    );

    if (!row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Increment click count
    await dbRun(
      'UPDATE urls SET clicks = clicks + 1 WHERE id = ?',
      [shortId]
    );

    res.redirect(row.original_url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to redirect' });
  }
});

// Get URL info and stats
app.get('/api/stats/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;

    const row = await dbGet(
      'SELECT id, original_url, created_at, clicks FROM urls WHERE id = ?',
      [shortId]
    );

    if (!row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({
      shortId: row.id,
      originalUrl: row.original_url,
      createdAt: row.created_at,
      clicks: row.clicks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
