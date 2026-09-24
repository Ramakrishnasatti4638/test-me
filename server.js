import express from 'express';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for URL mappings
const urlMap = new Map();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// API: Create a short URL
app.post('/api/shorten', (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl || typeof longUrl !== 'string' || longUrl.trim() === '') {
    return res.status(400).json({ error: 'Long URL is required' });
  }

  // Validate URL format
  try {
    const urlObj = new URL(longUrl);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortId = nanoid(6);
  urlMap.set(shortId, longUrl);

  res.json({
    shortId,
    longUrl,
    shortUrl: `http://localhost:${PORT}/${shortId}`
  });
});

// Redirect: When user visits short URL
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;

  // Don't redirect if it's a static file request
  if (shortId === 'index.html' || shortId.includes('.')) {
    res.sendFile(path.join(__dirname, 'public', shortId));
    return;
  }

  const longUrl = urlMap.get(shortId);

  if (!longUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(longUrl);
});

// API: Get all stored URLs (for debugging)
app.get('/api/urls', (req, res) => {
  const urls = Array.from(urlMap.entries()).map(([shortId, longUrl]) => ({
    shortId,
    longUrl,
    shortUrl: `http://localhost:${PORT}/${shortId}`
  }));
  res.json(urls);
});

// Start server only if this file is run directly (not imported for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app, urlMap };
