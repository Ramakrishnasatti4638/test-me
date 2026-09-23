const express = require('express');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { shortCode -> { originalUrl, createdAt, clicks } }
const urlStore = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Shorten a URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL. Please include http:// or https://' });
  }

  // Check if URL already shortened
  for (const [code, data] of urlStore.entries()) {
    if (data.originalUrl === url) {
      return res.json({
        shortCode: code,
        shortUrl: `${req.protocol}://${req.get('host')}/${code}`,
        originalUrl: url,
        clicks: data.clicks,
      });
    }
  }

  const shortCode = nanoid(6);
  urlStore.set(shortCode, {
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clicks: 0,
  });

  res.json({
    shortCode,
    shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
    originalUrl: url,
    clicks: 0,
  });
});

// Get all URLs
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlStore.entries()).map(([code, data]) => ({
    shortCode: code,
    shortUrl: `${req.protocol}://${req.get('host')}/${code}`,
    originalUrl: data.originalUrl,
    createdAt: data.createdAt,
    clicks: data.clicks,
  }));
  res.json(urls.reverse());
});

// Get stats for a short code
app.get('/api/stats/:code', (req, res) => {
  const { code } = req.params;
  const data = urlStore.get(code);

  if (!data) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortCode: code,
    shortUrl: `${req.protocol}://${req.get('host')}/${code}`,
    originalUrl: data.originalUrl,
    createdAt: data.createdAt,
    clicks: data.clicks,
  });
});

// Delete a short URL
app.delete('/api/urls/:code', (req, res) => {
  const { code } = req.params;
  if (!urlStore.has(code)) {
    return res.status(404).json({ error: 'Short URL not found' });
  }
  urlStore.delete(code);
  res.json({ message: 'Deleted successfully' });
});

// Redirect short URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const data = urlStore.get(code);

  if (!data) {
    return res.redirect('/?error=not_found');
  }

  data.clicks++;
  res.redirect(data.originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on port ${PORT}`);
});
