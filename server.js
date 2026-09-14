import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Get __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for URL mappings
const urlMap = new Map();

// Generate a short code from UUID
function generateShortCode() {
  return uuidv4().substring(0, 8);
}

// API Routes

// Create a shortened URL
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

  // Check if URL already shortened
  for (const [code, data] of urlMap) {
    if (data.originalUrl === url) {
      return res.json({
        shortCode: code,
        shortUrl: `http://localhost:${PORT}/${code}`,
        originalUrl: url,
        created: data.created,
      });
    }
  }

  // Generate new short code
  const shortCode = generateShortCode();
  urlMap.set(shortCode, {
    originalUrl: url,
    created: new Date().toISOString(),
    clicks: 0,
  });

  res.json({
    shortCode,
    shortUrl: `http://localhost:${PORT}/${shortCode}`,
    originalUrl: url,
    created: new Date().toISOString(),
  });
});

// Get URL info
app.get('/api/info/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const data = urlMap.get(shortCode);

  if (!data) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortCode,
    originalUrl: data.originalUrl,
    created: data.created,
    clicks: data.clicks,
  });
});

// Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const data = urlMap.get(shortCode);

  if (!data) {
    return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }

  data.clicks++;
  res.redirect(data.originalUrl);
});

// 404 handler for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
