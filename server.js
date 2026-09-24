const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'urls.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    // Create table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT UNIQUE NOT NULL,
        original_url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// Function to generate short code
function generateShortCode() {
  return uuidv4().substring(0, 8);
}

// API endpoint to create short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = generateShortCode();

  db.run(
    'INSERT INTO urls (short_code, original_url) VALUES (?, ?)',
    [shortCode, url],
    (err) => {
      if (err) {
        console.error('Error inserting URL:', err);
        return res.status(500).json({ error: 'Failed to create short URL' });
      }

      const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`;
      res.json({ shortUrl, shortCode, originalUrl: url });
    }
  );
});

// API endpoint to redirect to original URL
app.get('/s/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get(
    'SELECT original_url FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      res.redirect(row.original_url);
    }
  );
});

// API endpoint to get redirect info (for testing without actual redirect)
app.get('/api/redirect/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get(
    'SELECT original_url FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      res.json({ originalUrl: row.original_url, redirectUrl: `${req.protocol}://${req.get('host')}/s/${shortCode}` });
    }
  );
});

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
