const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten — create a short URL
app.post('/api/shorten', (req, res) => {
  const { url, customSlug } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Please provide a valid URL.' });
  }

  const slug = customSlug ? customSlug.trim() : nanoid(6);

  if (customSlug) {
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return res.status(400).json({ error: 'Custom alias can only contain letters, numbers, hyphens, and underscores.' });
    }
    const existing = db.getBySlug(slug);
    if (existing) {
      return res.status(409).json({ error: 'That custom alias is already taken.' });
    }
  }

  const entry = db.create(slug, url);
  const shortUrl = `${req.protocol}://${req.get('host')}/${slug}`;
  res.json({ shortUrl, slug, originalUrl: url, createdAt: entry.createdAt, clicks: 0 });
});

// GET /api/stats — list all shortened URLs
app.get('/api/stats', (req, res) => {
  const urls = db.getAll();
  res.json(urls);
});

// GET /api/stats/:slug — get stats for a single slug
app.get('/api/stats/:slug', (req, res) => {
  const entry = db.getBySlug(req.params.slug);
  if (!entry) return res.status(404).json({ error: 'Short URL not found.' });
  res.json(entry);
});

// DELETE /api/:slug — delete a short URL
app.delete('/api/:slug', (req, res) => {
  const deleted = db.remove(req.params.slug);
  if (!deleted) return res.status(404).json({ error: 'Short URL not found.' });
  res.json({ message: 'Deleted successfully.' });
});

// GET /:slug — redirect to original URL
app.get('/:slug', (req, res) => {
  const entry = db.getBySlug(req.params.slug);
  if (!entry) return res.redirect('/?error=not_found');
  db.incrementClicks(req.params.slug);
  res.redirect(entry.originalUrl);
});

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
