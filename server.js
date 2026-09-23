const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortCode: { originalUrl, clicks, createdAt } }
const urlStore = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten — create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Please include http:// or https://' });
  }

  const shortCode = nanoid(6);
  urlStore[shortCode] = {
    originalUrl: url,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };

  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
  return res.json({ shortUrl, shortCode });
});

// GET /api/stats — list all shortened URLs
app.get('/api/stats', (req, res) => {
  const entries = Object.entries(urlStore).map(([code, data]) => ({
    shortCode: code,
    originalUrl: data.originalUrl,
    clicks: data.clicks,
    createdAt: data.createdAt,
  }));
  res.json(entries.reverse());
});

// GET /:code — redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const entry = urlStore[code];

  if (!entry) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }

  entry.clicks += 1;
  return res.redirect(entry.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on port ${PORT}`);
});
