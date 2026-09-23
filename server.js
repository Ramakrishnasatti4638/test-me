const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortId -> { url, createdAt, clicks } }
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
    return res.status(400).json({ error: 'Invalid URL. Please include http:// or https://.' });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: 'Only http and https URLs are allowed.' });
  }

  const id = nanoid(7);
  urlStore[id] = { url, createdAt: new Date().toISOString(), clicks: 0 };

  return res.json({ shortId: id, shortUrl: `${req.protocol}://${req.get('host')}/${id}` });
});

// GET /api/urls — list all shortened URLs
app.get('/api/urls', (req, res) => {
  const list = Object.entries(urlStore).map(([id, data]) => ({
    id,
    url: data.url,
    createdAt: data.createdAt,
    clicks: data.clicks,
  }));
  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

// GET /:id — redirect to original URL
app.get('/:id', (req, res) => {
  const entry = urlStore[req.params.id];
  if (!entry) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  entry.clicks++;
  res.redirect(301, entry.url);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
