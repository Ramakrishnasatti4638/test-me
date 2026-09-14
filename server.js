import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const dbPath = path.join(__dirname, 'urls.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id TEXT PRIMARY KEY,
      original_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      click_count INTEGER DEFAULT 0
    )
  `);
});

// Helper function for database promises
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

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// API Routes

// Create short URL
app.post('/api/shorten', async (req, res) => {
  try {
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

    const shortId = nanoid(6);
    
    await dbRun(
      'INSERT INTO urls (id, original_url) VALUES (?, ?)',
      [shortId, url]
    );

    res.json({
      shortId,
      shortUrl: `http://localhost:${port}/${shortId}`,
      originalUrl: url
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Failed to create short URL' });
  }
});

// Get all URLs
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await dbAll('SELECT * FROM urls ORDER BY created_at DESC');
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

// Get URL details
app.get('/api/urls/:id', async (req, res) => {
  try {
    const url = await dbGet('SELECT * FROM urls WHERE id = ?', [req.params.id]);
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    res.json(url);
  } catch (error) {
    console.error('Error fetching URL:', error);
    res.status(500).json({ error: 'Failed to fetch URL' });
  }
});

// Redirect short URL
app.get('/:id', async (req, res) => {
  try {
    const url = await dbGet('SELECT * FROM urls WHERE id = ?', [req.params.id]);
    
    if (!url) {
      return res.status(404).send('Short URL not found');
    }

    // Increment click count
    await dbRun('UPDATE urls SET click_count = click_count + 1 WHERE id = ?', [req.params.id]);

    // Redirect to original URL
    res.redirect(url.original_url);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Error processing redirect');
  }
});

// Serve index.html for the React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`URL Shortener API running on http://localhost:${port}`);
});
