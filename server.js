const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortCode -> { originalUrl, clicks, createdAt } }
const urlStore = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten — create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A valid URL is required.' });
  }

  // Basic URL validation
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Make sure it starts with http:// or https://' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'Only http and https URLs are supported.' });
  }

  const code = nanoid(7);
  urlStore[code] = {
    originalUrl: url,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };

  return res.json({ shortCode: code, shortUrl: `${req.protocol}://${req.get('host')}/${code}` });
});

// GET /api/stats/:code — get stats for a short URL
app.get('/api/stats/:code', (req, res) => {
  const entry = urlStore[req.params.code];
  if (!entry) return res.status(404).json({ error: 'Short URL not found.' });

  res.json({
    shortCode: req.params.code,
    originalUrl: entry.originalUrl,
    clicks: entry.clicks,
    createdAt: entry.createdAt,
  });
});

// GET /:code — redirect to the original URL
app.get('/:code', (req, res) => {
  const entry = urlStore[req.params.code];
  if (!entry) return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));

  entry.clicks++;
  res.redirect(301, entry.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on port ${PORT}`);
});
