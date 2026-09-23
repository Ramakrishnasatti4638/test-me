const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();

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

  const code = nanoid(7);
  urlStore[code] = url;

  return res.status(201).json({ shortCode: code, shortUrl: `/s/${code}` });
});

// GET /api/urls  — list all shortened URLs
app.get('/api/urls', (req, res) => {
  const list = Object.entries(urlStore).map(([code, original]) => ({
    shortCode: code,
    shortUrl: `/s/${code}`,
    originalUrl: original,
  }));
  res.json(list);
});

// GET /s/:code  — redirect to original URL
app.get('/s/:code', (req, res) => {
  const { code } = req.params;
  const original = urlStore[code];

  if (!original) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }

  res.redirect(302, original);
});

// DELETE /api/urls/:code  — remove a short URL
app.delete('/api/urls/:code', (req, res) => {
  const { code } = req.params;
  if (!urlStore[code]) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }
  delete urlStore[code];
  res.status(200).json({ message: 'Deleted successfully.' });
});

// Export app for testing; only listen when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`URL Shortener running on http://localhost:${PORT}`));
}

module.exports = { app, urlStore };
