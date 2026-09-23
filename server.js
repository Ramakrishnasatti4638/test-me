const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();

// In-memory store: { shortCode -> { originalUrl, createdAt, clicks } }
const urlStore = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten  — create a short URL
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

  const code = nanoid(7);
  urlStore[code] = { originalUrl: url, createdAt: new Date().toISOString(), clicks: 0 };

  return res.status(201).json({
    shortCode: code,
    shortUrl: `${req.protocol}://${req.get('host')}/${code}`,
    originalUrl: url
  });
});

// GET /api/links  — list all shortened URLs
app.get('/api/links', (req, res) => {
  const links = Object.entries(urlStore).map(([code, data]) => ({
    shortCode: code,
    ...data
  }));
  res.json(links.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// GET /api/links/:code  — get info about a specific short code
app.get('/api/links/:code', (req, res) => {
  const entry = urlStore[req.params.code];
  if (!entry) return res.status(404).json({ error: 'Short URL not found.' });
  res.json({ shortCode: req.params.code, ...entry });
});

// DELETE /api/links/:code
app.delete('/api/links/:code', (req, res) => {
  const code = req.params.code;
  if (!urlStore[code]) return res.status(404).json({ error: 'Short URL not found.' });
  delete urlStore[code];
  res.json({ message: 'Deleted successfully.' });
});

// GET /:code  — redirect to original URL  ← the core redirect route
app.get('/:code', (req, res) => {
  const entry = urlStore[req.params.code];
  if (!entry) return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  entry.clicks += 1;
  res.redirect(302, entry.originalUrl);
});

// Export for testing
module.exports = { app, urlStore };

// Start server only when run directly (not when required by tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`URL Shortener running at http://localhost:${PORT}`));
}
