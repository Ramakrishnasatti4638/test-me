const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'urls.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory store
let urlMap = {};

// Load data from file on startup
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      urlMap = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Save data to file
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(urlMap, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Generate short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// API Routes

// Create short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  let shortCode = generateShortCode();
  // Ensure uniqueness
  while (urlMap[shortCode]) {
    shortCode = generateShortCode();
  }

  urlMap[shortCode] = {
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clicks: 0
  };

  saveData();

  res.json({
    shortCode,
    shortUrl: `http://localhost:3000/${shortCode}`,
    originalUrl: url
  });
});

// Get URL info
app.get('/api/info/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = urlMap[shortCode];

  if (!entry) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortCode,
    originalUrl: entry.originalUrl,
    createdAt: entry.createdAt,
    clicks: entry.clicks
  });
});

// Get all URLs
app.get('/api/urls', (req, res) => {
  const urls = Object.entries(urlMap).map(([shortCode, data]) => ({
    shortCode,
    shortUrl: `http://localhost:3000/${shortCode}`,
    originalUrl: data.originalUrl,
    createdAt: data.createdAt,
    clicks: data.clicks
  }));

  res.json(urls);
});

// Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const entry = urlMap[shortCode];

  if (!entry) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'not-found.html'));
  }

  // Increment click count
  entry.clicks++;
  saveData();

  res.redirect(entry.originalUrl);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Load data and start server
loadData();
app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
