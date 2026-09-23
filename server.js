const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();

// In-memory store: { shortCode -> originalUrl }
const urlStore = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten — create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = nanoid(7);
  urlStore[shortCode] = url;

  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
  return res.status(201).json({ shortCode, shortUrl, originalUrl: url });
});

// GET /api/urls — list all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Object.entries(urlStore).map(([shortCode, originalUrl]) => ({
    shortCode,
    originalUrl,
  }));
  return res.json(urls);
});

// GET /:shortCode — redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlStore[shortCode];

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  return res.redirect(302, originalUrl);
});

module.exports = app;
