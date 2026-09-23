const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortCode -> { originalUrl, clicks, createdAt } }
const urlStore = {};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/shorten — create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Make sure it includes http:// or https://' });
  }

  // Check if this URL was already shortened
  const existing = Object.entries(urlStore).find(([, v]) => v.originalUrl === url);
  if (existing) {
    const [code, data] = existing;
    return res.json({ shortCode: code, originalUrl: data.originalUrl, clicks: data.clicks });
  }

  const shortCode = nanoid(6);
  urlStore[shortCode] = { originalUrl: url, clicks: 0, createdAt: new Date().toISOString() };

  res.json({ shortCode, originalUrl: url, clicks: 0 });
});

// GET /api/stats — list all shortened URLs
app.get('/api/stats', (req, res) => {
  const links = Object.entries(urlStore).map(([code, data]) => ({
    shortCode: code,
    originalUrl: data.originalUrl,
    clicks: data.clicks,
    createdAt: data.createdAt,
  }));
  res.json(links.reverse());
});

// GET /:code — redirect to original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const entry = urlStore[code];

  if (!entry) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }

  entry.clicks++;
  res.redirect(entry.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
