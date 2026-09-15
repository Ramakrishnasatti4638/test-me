const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database
const urlDatabase = {};
const urlStats = {};

// Helper function to validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Routes

// GET all URLs
app.get('/api/urls', (req, res) => {
  const urls = Object.values(urlDatabase).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(urls);
});

// POST create shortened URL
app.post('/api/shorten', (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortId = nanoid(6);
  const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortId}`;

  const urlEntry = {
    shortId,
    shortUrl,
    originalUrl,
    clicks: 0,
    createdAt: new Date(),
  };

  urlDatabase[shortId] = urlEntry;
  urlStats[shortId] = [];

  res.json(urlEntry);
});

// GET redirect to original URL
app.get('/s/:shortId', (req, res) => {
  const { shortId } = req.params;

  if (!urlDatabase[shortId]) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  urlDatabase[shortId].clicks += 1;
  urlStats[shortId].push(new Date());

  res.redirect(urlDatabase[shortId].originalUrl);
});

// GET URL details
app.get('/api/urls/:shortId', (req, res) => {
  const { shortId } = req.params;

  if (!urlDatabase[shortId]) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json(urlDatabase[shortId]);
});

// Serve static files from React build
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      res.json({ message: 'URL Shortener API. Please use /api/shorten to create short URLs.' });
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
