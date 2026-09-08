const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = 3000;

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
    return res.status(400).json({ error: 'Invalid URL. Please include http:// or https://.' });
  }

  const code = nanoid(7);
  urlStore[code] = { originalUrl: url, createdAt: new Date().toISOString(), clicks: 0 };

  return res.json({ shortCode: code, shortUrl: `${req.protocol}://${req.get('host')}/${code}` });
});

// GET /api/links — list all shortened URLs
app.get('/api/links', (req, res) => {
  const links = Object.entries(urlStore).map(([code, data]) => ({
    code,
    ...data,
  }));
  res.json(links.reverse());
});

// DELETE /api/links/:code — delete a shortened URL
app.delete('/api/links/:code', (req, res) => {
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
