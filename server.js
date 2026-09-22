import express from 'express';
import cors from 'cors';
import { generateId } from './utils.js';

const app = express();
const PORT = 3000;

// In-memory store for URL mappings
const urlMap = new Map();
const idToOriginal = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// POST /api/shorten - Create a short URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Check if URL already exists
  for (const [shortId, originalUrl] of idToOriginal.entries()) {
    if (originalUrl === url) {
      return res.json({ shortId, shortUrl: `http://localhost:${PORT}/${shortId}` });
    }
  }

  // Generate new short ID
  const shortId = generateId();
  idToOriginal.set(shortId, url);
  urlMap.set(shortId, url);

  res.status(201).json({
    shortId,
    shortUrl: `http://localhost:${PORT}/${shortId}`,
    originalUrl: url
  });
});

// GET /api/stats/:shortId - Get stats for a short URL
app.get('/api/stats/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = idToOriginal.get(shortId);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortId,
    originalUrl,
    shortUrl: `http://localhost:${PORT}/${shortId}`
  });
});

// GET /:shortId - Redirect to original URL
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urlMap.get(shortId);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

// Start server
app.listen(PORT, () => {
  console.log(`URL Shortener app listening on http://localhost:${PORT}`);
});
