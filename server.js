const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory store for URL mappings
const urlMap = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Generate short code
  const shortCode = nanoid(6);
  urlMap.set(shortCode, url);

  res.json({
    shortCode,
    shortUrl: `http://localhost:3000/${shortCode}`,
    originalUrl: url
  });
});

// Redirect short URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  if (!urlMap.has(shortCode)) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }

  const originalUrl = urlMap.get(shortCode);
  res.redirect(originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
