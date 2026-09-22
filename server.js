const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage for shortened URLs
const urlMap = new Map();
let counter = 1000;

// Helper function to generate short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// API endpoint to shorten a URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Check if URL already shortened
  let shortCode = null;
  for (const [code, storedUrl] of urlMap.entries()) {
    if (storedUrl === url) {
      shortCode = code;
      break;
    }
  }

  // Generate new short code if not found
  if (!shortCode) {
    shortCode = generateShortCode();
    urlMap.set(shortCode, url);
  }

  const shortUrl = `http://localhost:${PORT}/${shortCode}`;
  res.json({ shortUrl, shortCode, originalUrl: url });
});

// API endpoint to get all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlMap.entries()).map(([shortCode, originalUrl]) => ({
    shortCode,
    originalUrl,
    shortUrl: `http://localhost:${PORT}/${shortCode}`
  }));
  res.json(urls);
});

// Redirect endpoint
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlMap.get(shortCode);

  if (!originalUrl) {
    return res.status(404).send('Short URL not found');
  }

  res.redirect(originalUrl);
});

// Home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`URL Shortener app running on http://localhost:${PORT}`);
});
