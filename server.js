const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortCode -> { originalUrl, createdAt, clicks } }
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
    return res.status(400).json({ error: 'Invalid URL. Make sure it includes http:// or https://' });
  }

  // Check if URL already shortened
  const existing = Object.entries(urlStore).find(([, v]) => v.originalUrl === url);
  if (existing) {
    return res.json({ shortCode: existing[0], shortUrl: buildShortUrl(req, existing[0]) });
  }

  const shortCode = nanoid(7);
  urlStore[shortCode] = {
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clicks: 0,
  };

  res.json({ shortCode, shortUrl: buildShortUrl(req, shortCode) });
});

// GET /api/urls — list all shortened URLs
app.get('/api/urls', (req, res) => {
  const list = Object.entries(urlStore).map(([shortCode, data]) => ({
    shortCode,
    shortUrl: buildShortUrl(req, shortCode),
    originalUrl: data.originalUrl,
    createdAt: data.createdAt,
    clicks: data.clicks,
  }));
  res.json(list.reverse());
});

// DELETE /api/urls/:code — delete a short URL
app.delete('/api/urls/:code', (req, res) => {
  const { code } = req.params;
  if (!urlStore[code]) {
    return res.status(404).json({ error: 'Short URL not found' });
  }
  delete urlStore[code];
  res.json({ success: true });
});

// GET /:code — redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const entry = urlStore[code];
  if (!entry) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  entry.clicks++;
  res.redirect(302, entry.originalUrl);
});

function buildShortUrl(req, code) {
  return `${req.protocol}://${req.get('host')}/${code}`;
}

app.listen(PORT, () => {
  console.log(`URL Shortener running on port ${PORT}`);
});
