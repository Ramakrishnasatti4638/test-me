const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();

// In-memory store: shortCode -> originalUrl
const urlStore = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten  { url: "https://example.com" }
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A valid URL is required.', message: 'A valid URL is required.' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format.', message: 'Invalid URL format.' });
  }

  // Check if already shortened
  const existing = Object.entries(urlStore).find(([, v]) => v === url);
  if (existing) {
    return res.json({ shortCode: existing[0], shortUrl: `${getBase(req)}/${existing[0]}` });
  }

  const shortCode = nanoid(7);
  urlStore[shortCode] = url;

  res.status(201).json({ shortCode, shortUrl: `${getBase(req)}/${shortCode}` });
});

// GET /api/urls  – list all shortened URLs
app.get('/api/urls', (req, res) => {
  const list = Object.entries(urlStore).map(([shortCode, originalUrl]) => ({
    shortCode,
    originalUrl,
    shortUrl: `${getBase(req)}/${shortCode}`,
  }));
  res.json(list);
});

// GET /:shortCode  – redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlStore[shortCode];

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found.', message: 'Short URL not found.' });
  }

  res.redirect(302, originalUrl);
});

function getBase(req) {
  return `${req.protocol}://${req.get('host')}`;
}

// Export for testing; only listen when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`URL Shortener running on port ${PORT}`));
}

module.exports = { app, urlStore };
