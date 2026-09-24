const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store: { shortCode -> originalUrl }
const urlStore = {};

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
  urlStore[code] = url;

  const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;
  return res.status(201).json({ shortUrl, code });
});

// GET /:code  — redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const original = urlStore[code];

  if (!original) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }

  return res.redirect(302, original);
});

// Export app for testing; only listen when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = { app, urlStore };
