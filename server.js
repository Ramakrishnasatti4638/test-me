const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortId -> { originalUrl, createdAt, clicks } }
const urlStore = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Shorten a URL
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

  const shortId = nanoid(7);
  urlStore[shortId] = {
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clicks: 0,
  };

  const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;
  res.json({ shortUrl, shortId });
});

// Get all URLs
app.get('/api/urls', (req, res) => {
  const urls = Object.entries(urlStore).map(([shortId, data]) => ({
    shortId,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortId}`,
    ...data,
  }));
  // Most recent first
  urls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(urls);
});

// Redirect short URL
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const entry = urlStore[shortId];

  if (!entry) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }

  entry.clicks += 1;
  res.redirect(301, entry.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
