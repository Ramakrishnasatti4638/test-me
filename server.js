import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// Initialize database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      short_code TEXT UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      clicks INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// API Routes
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  // Validate URL
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Generate short code
  const shortCode = nanoid(6);
  const shortUrl = `http://localhost:${PORT}/s/${shortCode}`;

  // Save to database
  db.run(
    'INSERT INTO urls (short_code, original_url) VALUES (?, ?)',
    [shortCode, url],
    (err) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Short code already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        shortCode,
        shortUrl,
        originalUrl: url
      });
    }
  );
});

// Get all URLs
app.get('/api/urls', (req, res) => {
  db.all(
    'SELECT short_code, original_url, clicks, created_at FROM urls ORDER BY created_at DESC LIMIT 50',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows || []);
    }
  );
});

// Redirect short URL
app.get('/s/:code', (req, res) => {
  const { code } = req.params;

  db.get(
    'SELECT original_url FROM urls WHERE short_code = ?',
    [code],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      // Increment click count and then redirect
      db.run(
        'UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?',
        [code],
        (updateErr) => {
          if (updateErr) {
            console.error('Failed to increment click count:', updateErr);
          }
          res.redirect(row.original_url);
        }
      );
    }
  );
});

// Serve index.html for client routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 URL Shortener is running on http://localhost:${PORT}`);
  console.log(`📝 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`\n✨ Ready to shorten URLs!\n`);
});
