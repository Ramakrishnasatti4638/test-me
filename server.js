const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortCode -> originalUrl }
const urlStore = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten — create a short link
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

  const shortUrl = `${req.protocol}://${req.get('host')}/r/${code}`;
  return res.status(201).json({ shortUrl, code });
});

// GET /r/:code — redirect to original URL
app.get('/r/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlStore.get(code);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short link not found.' });
  }

  return res.redirect(301, originalUrl);
});

// Export app for testing; only listen when run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`URL Shortener running at http://localhost:${PORT}`);
  });
}

module.exports = { app, urlStore };
