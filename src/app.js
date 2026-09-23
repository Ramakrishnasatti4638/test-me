const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');
const store = require('./store');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// POST /api/shorten  — create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const code = nanoid(7);
  store.save(code, url);

  return res.status(201).json({ code, shortUrl: `/r/${code}` });
});

// GET /api/urls  — list all shortened URLs
app.get('/api/urls', (req, res) => {
  res.json(store.all());
});

// GET /r/:code  — redirect to original URL
app.get('/r/:code', (req, res) => {
  const entry = store.find(req.params.code);
  if (!entry) {
    return res.status(404).json({ error: 'Short URL not found' });
  }
  store.incrementClicks(req.params.code);
  res.redirect(302, entry.originalUrl);
});

module.exports = app;
