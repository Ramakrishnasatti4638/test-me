const express = require('express');
const cors = require('cors');
const path = require('path');
const { isValidUrl, createLink, getLink, getAllLinks, incrementClick, deleteLink, hasCode } = require('./store');

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// POST /api/shorten
app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL. Must be a valid http or https URL.' });
  }

  if (customAlias !== undefined && customAlias !== null && customAlias !== '') {
    const trimmed = customAlias.trim();
    if (!/^[a-zA-Z0-9_-]{1,32}$/.test(trimmed)) {
      return res.status(400).json({ error: 'Custom alias must be 1–32 alphanumeric characters (a-z, A-Z, 0-9, _ -).' });
    }
    if (hasCode(trimmed)) {
      return res.status(409).json({ error: `Alias "${trimmed}" is already taken.` });
    }
    const entry = createLink(url, trimmed);
    return res.status(201).json(entry);
  }

  const entry = createLink(url, null);
  return res.status(201).json(entry);
});

// GET /api/links — all links sorted by clickCount desc
app.get('/api/links', (req, res) => {
  res.json(getAllLinks());
});

// DELETE /api/links/:shortCode
app.delete('/api/links/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  if (!hasCode(shortCode)) {
    return res.status(404).json({ error: 'Short code not found.' });
  }
  deleteLink(shortCode);
  res.status(200).json({ message: 'Deleted successfully.' });
});

// GET /:shortCode — redirect
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = getLink(shortCode);
  if (!entry) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }
  incrementClick(shortCode);
  res.redirect(302, entry.originalUrl);
});

module.exports = app;
