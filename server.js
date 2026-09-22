import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory storage for URL mappings
const urlMap = new Map();

// POST /api/shorten - Create a shortened URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Validate that it's a valid URL
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Generate short ID
  const shortId = nanoid(8);

  // Store mapping
  urlMap.set(shortId, url);

  res.json({
    shortId,
    shortUrl: `http://localhost:${PORT}/${shortId}`,
    originalUrl: url
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

// GET /api/stats/:shortId - Get statistics for a short URL
app.get('/api/stats/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urlMap.get(shortId);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortId,
    originalUrl,
    created: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
