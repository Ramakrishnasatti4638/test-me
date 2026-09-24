const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');
const store = require('./store');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten — create a short link
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Please include http:// or https://' });
  }

  const code = nanoid(7);
  store.addLink(code, url);

  return res.status(201).json({
    code,
    shortUrl: `${req.protocol}://${req.get('host')}/${code}`,
    originalUrl: url,
  });
});

// GET /api/links — list all links
app.get('/api/links', (req, res) => {
  res.json(store.getAllLinks());
});

// GET /:code — redirect to the original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const link = store.getLink(code);

  if (!link) {
    return res.status(404).json({ error: 'Short link not found' });
  }

  store.incrementClicks(code);
  return res.redirect(301, link.originalUrl);
});

module.exports = app;
