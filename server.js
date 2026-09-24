const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortCode -> originalUrl }
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

  // Check if URL already shortened
  const existing = Object.entries(urlStore).find(([, v]) => v === url);
  if (existing) {
    return res.json({ shortCode: existing[0], shortUrl: `/r/${existing[0]}` });
  }

  const shortCode = nanoid(7);
  urlStore[shortCode] = url;

  res.json({ shortCode, shortUrl: `/r/${shortCode}` });
});

// GET /api/urls  — list all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Object.entries(urlStore).map(([shortCode, originalUrl]) => ({
    shortCode,
    originalUrl,
    shortUrl: `/r/${shortCode}`,
  }));
  res.json(urls);
});

// GET /r/:code  — redirect to original URL
app.get('/r/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlStore[code];

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }

  res.redirect(302, originalUrl);
});

// DELETE /api/urls/:code — remove a short URL
app.delete('/api/urls/:code', (req, res) => {
  const { code } = req.params;
  if (!urlStore[code]) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }
  delete urlStore[code];
  res.json({ message: 'Deleted successfully.' });
});

// Export for testing — start server only when run directly
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = { app, urlStore };
