import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// In-memory storage for URL mappings
const urlMap = new Map();
let shortenCounter = 1000;

// Utility function to generate short code
function generateShortCode() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  let num = shortenCounter++;
  do {
    code = chars[num % chars.length] + code;
    num = Math.floor(num / chars.length);
  } while (num > 0);
  return code;
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// API Routes
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const shortCode = generateShortCode();
  urlMap.set(shortCode, url);

  res.json({
    originalUrl: url,
    shortUrl: `http://localhost:${PORT}/${shortCode}`,
    shortCode
  });
});

// Redirect route
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlMap.get(shortCode);

  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`URL Shortener server running at http://localhost:${PORT}`);
});
