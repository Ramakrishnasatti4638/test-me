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
    return res.status(400).json({ error: 'A valid URL is required.' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format. Include http:// or https://' });
  }

  // Check if URL already shortened
  const existing = Object.entries(urlStore).find(([, v]) => v.originalUrl === url);
  if (existing) {
    const [code, data] = existing;
    return res.json({ shortCode: code, originalUrl: data.originalUrl, clicks: data.clicks, createdAt: data.createdAt });
  }

  const shortCode = nanoid(7);
  urlStore[shortCode] = { originalUrl: url, createdAt: new Date().toISOString(), clicks: 0 };

  return res.status(201).json({ shortCode, originalUrl: url, clicks: 0, createdAt: urlStore[shortCode].createdAt });
});

// GET /api/urls — list all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Object.entries(urlStore).map(([shortCode, data]) => ({
    shortCode,
    ...data,
  }));
  // Most recent first
  urls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(urls);
});

// GET /api/urls/:code — get info about a short URL
app.get('/api/urls/:code', (req, res) => {
  const entry = urlStore[req.params.code];
  if (!entry) return res.status(404).json({ error: 'Short URL not found.' });
  res.json({ shortCode: req.params.code, ...entry });
});

// DELETE /api/urls/:code — delete a short URL
app.delete('/api/urls/:code', (req, res) => {
  const code = req.params.code;
  if (!urlStore[code]) return res.status(404).json({ error: 'Short URL not found.' });
  delete urlStore[code];
  res.json({ message: 'Deleted successfully.' });
});

// GET /:code — redirect to original URL
app.get('/:code', (req, res) => {
  const entry = urlStore[req.params.code];
  if (!entry) return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  entry.clicks++;
  res.redirect(301, entry.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on port ${PORT}`);
});
