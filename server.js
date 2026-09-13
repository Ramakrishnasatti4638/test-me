import express from 'express';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const db = new sqlite3.Database('./urls.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id TEXT PRIMARY KEY,
      short_code TEXT UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      clicks INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Database initialized');
    }
  });
}

// Helper function to generate short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Routes

// Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL
  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const id = uuidv4();
  const shortCode = generateShortCode();

  db.run(
    'INSERT INTO urls (id, short_code, original_url) VALUES (?, ?, ?)',
    [id, shortCode, url],
    (err) => {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          // Retry with a new short code
          return app._router.stack.find(r => r.route?.path === '/api/shorten').handle(req, res);
        }
        return res.status(500).json({ error: 'Failed to create shortened URL' });
      }

      res.json({
        id,
        short_code: shortCode,
        original_url: url,
        shortUrl: `http://localhost:3001/${shortCode}`,
        created_at: new Date().toISOString(),
      });
    }
  );
});

// Get all URLs
app.get('/api/urls/all', (req, res) => {
  db.all(
    'SELECT * FROM urls ORDER BY created_at DESC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch URLs' });
      }
      res.json(rows || []);
    }
  );
});

// Get stats for a short code
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  db.get(
    'SELECT id, short_code, original_url, clicks, created_at FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }
      if (!row) {
        return res.status(404).json({ error: 'URL not found' });
      }

      res.json({
        id: row.id,
        shortCode: row.short_code,
        originalUrl: row.original_url,
        clicks: row.clicks,
        createdAt: row.created_at,
      });
    }
  );
});

// Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  // Skip static files and API routes
  if (shortCode.includes('.') || shortCode.startsWith('api')) {
    return res.status(404).json({ error: 'Not found' });
  }

  db.run(
    'UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?',
    [shortCode],
    (err) => {
      if (err) {
        console.error('Error updating clicks:', err);
      }
    }
  );

  db.get(
    'SELECT original_url FROM urls WHERE short_code = ?',
    [shortCode],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'URL not found' });
      }
      res.redirect(row.original_url);
    }
  );
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`URL Shortener server running on http://localhost:${PORT}`);
});
