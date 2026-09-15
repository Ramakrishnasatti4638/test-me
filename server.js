const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortCode -> { url, createdAt, clicks } }
const urlStore = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Shorten a URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A valid URL is required.' });
  }

  // Basic URL validation
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Please include http:// or https://' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'Only http and https URLs are allowed.' });
  }

  // Check if URL was already shortened
  const existing = Object.entries(urlStore).find(([, v]) => v.url === url);
  if (existing) {
    const [code, data] = existing;
    return res.json({ shortCode: code, shortUrl: buildShortUrl(req, code), clicks: data.clicks });
  }

  const shortCode = nanoid(7);
  urlStore[shortCode] = { url, createdAt: new Date().toISOString(), clicks: 0 };

  res.json({ shortCode, shortUrl: buildShortUrl(req, shortCode), clicks: 0 });
});

// Get all shortened URLs (for stats)
app.get('/api/links', (req, res) => {
  const links = Object.entries(urlStore).map(([code, data]) => ({
    shortCode: code,
    shortUrl: buildShortUrl(req, code),
    url: data.url,
    createdAt: data.createdAt,
    clicks: data.clicks,
  }));
  // Most recent first
  links.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(links);
});

// Delete a shortened URL
app.delete('/api/links/:code', (req, res) => {
  const { code } = req.params;
  if (!urlStore[code]) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }
  delete urlStore[code];
  res.json({ success: true });
});

// Redirect short URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const entry = urlStore[code];
  if (!entry) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  entry.clicks += 1;
  res.redirect(301, entry.url);
});

function buildShortUrl(req, code) {
  return `${req.protocol}://${req.get('host')}/${code}`;
}

app.listen(PORT, () => {
  console.log(`URL Shortener running on port ${PORT}`);
});
