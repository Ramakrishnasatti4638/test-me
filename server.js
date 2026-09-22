const express = require('express');
const cors = require('cors');
const shortid = require('shortid');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory store for URLs
const urlMap = {};

// POST /api/shorten - Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    new URL(url); // Validate URL format
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Simulate processing delay (1.5 seconds) to show loading state
  setTimeout(() => {
    // Generate short ID
    const shortCode = shortid.generate();
    urlMap[shortCode] = url;

    res.json({
      originalUrl: url,
      shortUrl: `http://localhost:${PORT}/${shortCode}`,
      shortCode: shortCode
    });
  }, 1500);
});

// GET /:shortCode - Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlMap[shortCode];

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

// GET /api/stats/:shortCode - Get stats for a shortened URL
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlMap[shortCode];

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortCode: shortCode,
    originalUrl: originalUrl,
    shortUrl: `http://localhost:${PORT}/${shortCode}`
  });
});

app.listen(PORT, () => {
  console.log(`URL Shortener app running at http://localhost:${PORT}`);
});
