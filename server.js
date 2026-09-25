const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage for URLs
const urlMap = new Map();
const baseUrl = 'http://localhost:3000/s/';

// Helper function to generate short code
function generateShortCode() {
  return uuidv4().substring(0, 8);
}

// Helper function to validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// POST /api/shorten - Create a short URL
app.post('/api/shorten', (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'Long URL is required' });
  }

  if (!isValidUrl(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Check if URL already exists
  for (let [code, url] of urlMap) {
    if (url.longUrl === longUrl) {
      return res.json({
        shortCode: code,
        shortUrl: baseUrl + code,
        longUrl: longUrl,
        isNew: false
      });
    }
  }

  const shortCode = generateShortCode();
  urlMap.set(shortCode, {
    longUrl: longUrl,
    createdAt: new Date(),
    clicks: 0
  });

  res.json({
    shortCode: shortCode,
    shortUrl: baseUrl + shortCode,
    longUrl: longUrl,
    isNew: true
  });
});

// GET /s/:shortCode - Redirect to long URL
app.get('/s/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const urlData = urlMap.get(shortCode);

  if (!urlData) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  urlData.clicks++;
  res.redirect(urlData.longUrl);
});

// GET /api/stats/:shortCode - Get stats for a short URL
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const urlData = urlMap.get(shortCode);

  if (!urlData) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortCode: shortCode,
    longUrl: urlData.longUrl,
    shortUrl: baseUrl + shortCode,
    clicks: urlData.clicks,
    createdAt: urlData.createdAt
  });
});

// GET /api/all - Get all shortened URLs
app.get('/api/all', (req, res) => {
  const urls = Array.from(urlMap.entries()).map(([code, data]) => ({
    shortCode: code,
    shortUrl: baseUrl + code,
    longUrl: data.longUrl,
    clicks: data.clicks,
    createdAt: data.createdAt
  }));

  res.json(urls);
});

// Serve the main app on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
