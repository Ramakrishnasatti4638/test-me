const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();

// In-memory store: { code -> originalUrl }
const urlStore = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten  — create a short code
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A valid URL is required.' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  const code = nanoid(7);
  urlStore[code] = url;

  return res.status(201).json({ code, shortUrl: `/${code}` });
});

// GET /api/urls  — list all shortened URLs (for testing/debug)
app.get('/api/urls', (req, res) => {
  const entries = Object.entries(urlStore).map(([code, originalUrl]) => ({
    code,
    originalUrl,
    shortUrl: `/${code}`,
  }));
  return res.json(entries);
});

// GET /:code  — redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlStore[code];

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }

  return res.redirect(302, originalUrl);
});

module.exports = { app, urlStore };
