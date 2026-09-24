import express from 'express';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// In-memory URL storage
const urlMap = new Map();

// Middleware
app.use(express.json());

// CRITICAL: Redirect route BEFORE static middleware to ensure it's handled properly
// This prevents static files from interfering with short code routes
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  // Skip if it looks like a file extension or API route
  if (shortCode.includes('.') || shortCode.startsWith('api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const originalUrl = urlMap.get(shortCode);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

// Now serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API: Shorten URL
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

  const shortCode = nanoid(6);
  urlMap.set(shortCode, url);

  res.json({
    shortCode,
    shortUrl: `http://localhost:3000/${shortCode}`,
    originalUrl: url,
  });
});

// API: Get stats (for testing)
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlMap.get(shortCode);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({ shortCode, originalUrl });
});

// Serve index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { urlMap, app };
