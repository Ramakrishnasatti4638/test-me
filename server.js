const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage for URLs
const urlMap = new Map();
let counter = 0;

// Function to generate short code
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  let num = counter++;
  do {
    code = chars[num % chars.length] + code;
    num = Math.floor(num / chars.length);
  } while (num > 0);
  return code;
}

// API endpoint to create short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const shortCode = generateShortCode();
  urlMap.set(shortCode, url);

  res.json({
    shortCode,
    shortUrl: `http://localhost:3000/s/${shortCode}`,
    originalUrl: url
  });
});

// API endpoint to get all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlMap.entries()).map(([code, url]) => ({
    shortCode: code,
    shortUrl: `http://localhost:3000/s/${code}`,
    originalUrl: url
  }));
  res.json(urls);
});

// Redirect endpoint
app.get('/s/:code', (req, res) => {
  const { code } = req.params;
  const originalUrl = urlMap.get(code);

  if (!originalUrl) {
    return res.status(404).send('Short URL not found');
  }

  // Ensure URL has protocol
  let redirectUrl = originalUrl;
  if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
    redirectUrl = 'https://' + redirectUrl;
  }

  res.redirect(redirectUrl);
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
