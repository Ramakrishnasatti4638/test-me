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
  const { url, customCode } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Include http:// or https://.' });
  }

  // Custom code validation
  if (customCode) {
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(customCode)) {
      return res.status(400).json({ error: 'Custom code must be 3–20 characters (letters, numbers, - _).' });
    }
    if (urlStore[customCode]) {
      return res.status(409).json({ error: 'That custom code is already taken.' });
    }
  }

  const code = customCode || nanoid(6);
  urlStore[code] = { url, createdAt: new Date().toISOString(), clicks: 0 };

  res.json({ shortCode: code, shortUrl: `/s/${code}` });
});

// Get all URLs (for stats panel)
app.get('/api/urls', (req, res) => {
  const list = Object.entries(urlStore).map(([code, data]) => ({
    code,
    ...data,
  }));
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

// Delete a short URL
app.delete('/api/urls/:code', (req, res) => {
  const { code } = req.params;
  if (!urlStore[code]) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }
  delete urlStore[code];
  res.json({ success: true });
});

// Redirect
app.get('/s/:code', (req, res) => {
  const { code } = req.params;
  const entry = urlStore[code];
  if (!entry) {
    return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }
  entry.clicks++;
  res.redirect(301, entry.url);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
