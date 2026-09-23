const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store: { code -> originalUrl }
const urlStore = new Map();

// POST /api/shorten  { url: "https://..." }  -> { shortCode, shortUrl }
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
  urlStore.set(code, url);

  const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;
  return res.status(201).json({ shortCode: code, shortUrl });
});

// GET /:code  -> 302 redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlStore.get(code);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }

  return res.redirect(302, originalUrl);
});

// Export app for testing; only listen when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`URL Shortener running on port ${PORT}`));
}

module.exports = { app, urlStore };
