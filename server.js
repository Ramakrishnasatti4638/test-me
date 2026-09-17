import express from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

let db;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
async function initDb() {
  db = await open({
    filename: './urls.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      short_code TEXT UNIQUE NOT NULL,
      long_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      clicks INTEGER DEFAULT 0
    )
  `);
}

// Routes
app.post('/api/shorten', async (req, res) => {
  try {
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

    const shortCode = nanoid(6);

    await db.run('INSERT INTO urls (short_code, long_url) VALUES (?, ?)', [
      shortCode,
      url
    ]);

    const shortUrl = `http://localhost:${PORT}/${shortCode}`;

    res.json({
      shortCode,
      shortUrl,
      longUrl: url
    });
  } catch (err) {
    console.error('Error shortening URL:', err);
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});

app.get('/api/stats/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    const row = await db.get(
      'SELECT * FROM urls WHERE short_code = ?',
      [shortCode]
    );

    if (!row) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({
      shortCode: row.short_code,
      longUrl: row.long_url,
      createdAt: row.created_at,
      clicks: row.clicks
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    const row = await db.get(
      'SELECT * FROM urls WHERE short_code = ?',
      [shortCode]
    );

    if (!row) {
      return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }

    // Increment click count
    await db.run('UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?', [
      shortCode
    ]);

    res.redirect(row.long_url);
  } catch (err) {
    console.error('Error redirecting:', err);
    res.status(500).send('Error redirecting to URL');
  }
});

// Serve 404 page
app.get('/404', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start server
async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`URL Shortener app running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
