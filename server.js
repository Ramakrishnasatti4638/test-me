const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();

// In-memory store: { shortCode -> originalUrl }
const urlStore = new Map();

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
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  const code = nanoid(6);
  urlStore.set(code, url);

  res.status(201).json({ shortCode: code, shortUrl: `/r/${code}` });
});

// GET /r/:code — redirect to original URL
app.get('/r/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlStore.get(code);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }

  res.redirect(301, originalUrl);
});

// GET /api/urls — list all shortened URLs (useful for UI)
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlStore.entries()).map(([code, originalUrl]) => ({
    shortCode: code,
    shortUrl: `/r/${code}`,
    originalUrl,
  }));
  res.json(urls);
});

// Export app for testing; only listen when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`URL Shortener running on port ${PORT}`));
}

module.exports = { app, urlStore };
