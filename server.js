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

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required.' });
  }

  // Basic URL validation
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Make sure it includes http:// or https://' });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: 'Only http and https URLs are supported.' });
  }

  // Check if URL already shortened
  const existing = Object.values(urlStore).find(entry => entry.originalUrl === url);
  if (existing) {
    return res.json({ shortCode: existing.shortCode, originalUrl: url });
  }

  const shortCode = nanoid(7);
  urlStore[shortCode] = {
    shortCode,
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clicks: 0,
  };

  res.json({ shortCode, originalUrl: url });
});

// GET /api/urls — list all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Object.values(urlStore).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(urls);
});

// DELETE /api/urls/:code — delete a shortened URL
app.delete('/api/urls/:code', (req, res) => {
  const { code } = req.params;
  if (!urlStore[code]) {
    return res.status(404).json({ error: 'Short URL not found.' });
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

  entry.clicks += 1;
  res.redirect(entry.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
