const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for shortened URLs
const urlMap = new Map();
let counter = 1000;

// Helper function to generate short code
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  let num = counter++;
  while (num > 0) {
    code = chars[num % chars.length] + code;
    num = Math.floor(num / chars.length);
  }
  return code;
}

// API endpoint to shorten a URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL
  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const shortCode = generateShortCode();
  urlMap.set(shortCode, url);

  const shortUrl = `http://localhost:${PORT}/${shortCode}`;
  res.json({ shortUrl, shortCode, originalUrl: url });
});

// API endpoint to get all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlMap.entries()).map(([code, url]) => ({
    shortCode: code,
    originalUrl: url,
    shortUrl: `http://localhost:${PORT}/${code}`
  }));
  res.json(urls);
});

// Redirect endpoint
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlMap.get(shortCode);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

// Serve the index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
