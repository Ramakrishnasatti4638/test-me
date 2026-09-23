const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store: { shortCode -> originalUrl }
const urlStore = {};

// POST /api/shorten  — { url: "https://..." } → { shortUrl, shortCode }
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

  const shortCode = nanoid(7);
  urlStore[shortCode] = url;

  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
  return res.status(201).json({ shortUrl, shortCode });
});

// GET /api/urls  — list all stored URLs (useful for tests & UI)
app.get('/api/urls', (req, res) => {
  const list = Object.entries(urlStore).map(([code, original]) => ({
    shortCode: code,
    originalUrl: original,
  }));
  res.json(list);
});

// GET /:code  — redirect to the original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlStore[code];

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }

  return res.redirect(302, originalUrl);
});

module.exports = { app, urlStore };
