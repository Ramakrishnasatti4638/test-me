const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory URL storage
const urlMap = new Map();

// Routes

// Serve the index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Generate short ID
  const shortId = nanoid(8);
  const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortId}`;

  // Store mapping
  urlMap.set(shortId, {
    originalUrl: url,
    createdAt: new Date(),
    clicks: 0
  });

  res.json({
    originalUrl: url,
    shortUrl: shortUrl,
    shortId: shortId
  });
});

// Redirect to original URL
app.get('/s/:id', (req, res) => {
  const { id } = req.params;
  const urlData = urlMap.get(id);

  if (!urlData) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  urlData.clicks++;
  res.redirect(urlData.originalUrl);
});

// Get URL statistics
app.get('/api/stats/:id', (req, res) => {
  const { id } = req.params;
  const urlData = urlMap.get(id);

  if (!urlData) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortId: id,
    originalUrl: urlData.originalUrl,
    createdAt: urlData.createdAt,
    clicks: urlData.clicks
  });
});

// Get all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlMap.entries()).map(([shortId, data]) => ({
    shortId,
    shortUrl: `${req.protocol}://${req.get('host')}/s/${shortId}`,
    ...data
  }));
  res.json(urls);
});

app.listen(PORT, () => {
  console.log(`URL Shortener app running at http://localhost:${PORT}`);
});
