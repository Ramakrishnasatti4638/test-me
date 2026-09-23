const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();

// In-memory store: { code -> originalUrl }
const store = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /shorten  { url: "https://..." }  -> { shortCode, shortUrl }
app.post('/shorten', (req, res) => {
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
  store[code] = url;

  const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;
  return res.status(201).json({ shortCode: code, shortUrl });
});

// GET /stats/:code  -> { originalUrl, shortCode }
app.get('/stats/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = store[code];
  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }
  return res.json({ shortCode: code, originalUrl });
});

// GET /:code  -> redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = store[code];
  if (!originalUrl) {
    return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }
  return res.redirect(302, originalUrl);
});

// Export for testing
module.exports = { app, store };
