const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for shortened URLs
const urlMap = new Map();
let counter = 1000; // Start counter at 1000 for more realistic short codes

// Helper function to generate short code
function generateShortCode(id) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  let num = id;
  while (num > 0) {
    code = chars[num % chars.length] + code;
    num = Math.floor(num / chars.length);
  }
  return code || 'a';
}

// Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const id = counter++;
  const shortCode = generateShortCode(id);
  const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`;

  urlMap.set(shortCode, {
    originalUrl: url,
    shortCode,
    shortUrl,
    createdAt: new Date(),
    clicks: 0
  });

  res.json({
    originalUrl: url,
    shortUrl,
    shortCode,
    createdAt: new Date()
  });
});

// Redirect to original URL
app.get('/s/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = urlMap.get(shortCode);

  if (!entry) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  entry.clicks++;
  res.redirect(entry.originalUrl);
});

// Get URL info
app.get('/api/info/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = urlMap.get(shortCode);

  if (!entry) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json(entry);
});

// Get all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlMap.values());
  res.json(urls);
});

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`URL Shortener app running on http://localhost:${PORT}`);
});
