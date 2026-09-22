const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for URL mappings
const urlMap = new Map();

// Generate short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// API endpoint to shorten URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = generateShortCode();
  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;

  urlMap.set(shortCode, url);

  res.json({
    originalUrl: url,
    shortUrl: shortUrl,
    shortCode: shortCode
  });
});

// Redirect endpoint
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlMap.get(shortCode);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(301, originalUrl);
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`URL Shortener server running on http://localhost:${PORT}`);
});
