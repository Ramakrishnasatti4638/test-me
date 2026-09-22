const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for URL mappings
const urlMap = new Map();
let shortCodeCounter = 1000;

/**
 * Generate a short code from a number
 */
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  let num = shortCodeCounter++;
  
  while (num > 0) {
    code = chars[num % chars.length] + code;
    num = Math.floor(num / chars.length);
  }
  
  return code;
}

/**
 * Validate URL
 */
function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Routes

/**
 * POST /api/shorten - Create a shortened URL
 */
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = generateShortCode();
  urlMap.set(shortCode, url);

  res.json({
    shortCode,
    shortUrl: `http://localhost:${PORT}/${shortCode}`,
    originalUrl: url
  });
});

/**
 * GET /api/links - Get all shortened links
 */
app.get('/api/links', (req, res) => {
  const links = Array.from(urlMap.entries()).map(([shortCode, originalUrl]) => ({
    shortCode,
    shortUrl: `http://localhost:${PORT}/${shortCode}`,
    originalUrl
  }));

  res.json(links);
});

/**
 * GET /:shortCode - Redirect to original URL
 */
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlMap.get(shortCode);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

app.listen(PORT, () => {
  console.log(`URL Shortener server running on http://localhost:${PORT}`);
});
