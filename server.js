import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// In-memory storage for URL mappings
const urlMap = new Map();
let counter = 1000;

// Helper function to generate short code
const generateShortCode = () => {
  return Math.random().toString(36).substring(2, 8);
};

// API endpoint to create a short URL
app.post('/api/shorten', (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'Long URL is required' });
  }

  // Validate URL format
  try {
    new URL(longUrl);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = generateShortCode();
  const shortUrl = `http://localhost:3000/${shortCode}`;

  urlMap.set(shortCode, longUrl);

  res.json({
    longUrl,
    shortUrl,
    shortCode,
  });
});

// API endpoint to redirect from short code to long URL
app.get('/api/redirect/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const longUrl = urlMap.get(shortCode);

  if (!longUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({ longUrl });
});

// Redirect endpoint (browser-friendly)
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const longUrl = urlMap.get(shortCode);

  if (!longUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(302, longUrl);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});

export default app;
