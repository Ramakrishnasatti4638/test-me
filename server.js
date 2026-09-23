const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();

// In-memory store: { shortCode -> originalUrl }
const urlStore = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten  { url: "https://..." }
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
  return res.status(201).json({ shortUrl, code, originalUrl: url });
});

// GET /api/links  — list all shortened links
app.get('/api/links', (req, res) => {
  const links = [];
  urlStore.forEach((originalUrl, code) => {
    links.push({ code, originalUrl });
  });
  res.json(links);
});

// GET /:code  — redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlStore.get(code);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }

  return res.redirect(302, originalUrl);
});

module.exports = { app, urlStore };
