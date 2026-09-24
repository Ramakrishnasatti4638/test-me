const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();

// In-memory store: { shortCode -> originalUrl }
const urlStore = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten  { url: "https://example.com" }
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

  // Return existing code if URL was already shortened
  const existing = Object.entries(urlStore).find(([, v]) => v === url);
  if (existing) {
    const [code] = existing;
    return res.json({ shortCode: code, shortUrl: `${getBaseUrl(req)}/${code}` });
  }

  const code = nanoid(6);
  urlStore[code] = url;

  return res.status(201).json({ shortCode: code, shortUrl: `${getBaseUrl(req)}/${code}` });
});

// GET /api/urls  — list all shortened URLs
app.get('/api/urls', (req, res) => {
  const list = Object.entries(urlStore).map(([code, originalUrl]) => ({
    shortCode: code,
    shortUrl: `${getBaseUrl(req)}/${code}`,
    originalUrl,
  }));
  res.json(list);
});

// GET /:code  — redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlStore[code];

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }

  return res.redirect(301, originalUrl);
});

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

// Export app for testing; only listen when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`URL Shortener running on http://localhost:${PORT}`));
}

module.exports = { app, urlStore };
