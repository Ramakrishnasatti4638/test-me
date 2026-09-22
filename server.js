const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for URL mappings
const urlMap = new Map();
let shortenedUrlCounter = 1000;

// Utility function to generate short ID
function generateShortId() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  let num = shortenedUrlCounter++;
  
  while (num > 0) {
    result = characters[num % characters.length] + result;
    num = Math.floor(num / characters.length);
  }
  
  return result;
}

// Validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// API endpoint to shorten a URL
app.post('/api/shorten', (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Check if URL already shortened
  for (const [shortId, url] of urlMap.entries()) {
    if (url === longUrl) {
      return res.json({ 
        shortId, 
        shortUrl: `http://localhost:${PORT}/${shortId}`,
        longUrl 
      });
    }
  }

  const shortId = generateShortId();
  urlMap.set(shortId, longUrl);

  res.json({
    shortId,
    shortUrl: `http://localhost:${PORT}/${shortId}`,
    longUrl
  });
});

// API endpoint to get all shortened URLs
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlMap.entries()).map(([shortId, longUrl]) => ({
    shortId,
    shortUrl: `http://localhost:${PORT}/${shortId}`,
    longUrl
  }));
  res.json(urls);
});

// Redirect endpoint
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const longUrl = urlMap.get(shortId);

  if (!longUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(longUrl);
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`URL Shortener app running on http://localhost:${PORT}`);
});
