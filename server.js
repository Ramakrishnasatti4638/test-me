import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// In-memory storage for URL mappings
const urlMap = new Map();
let shortCodeCounter = 1000;

// Generate a short code
function generateShortCode() {
  const code = shortCodeCounter.toString(36); // Convert to base36 for shorter codes
  shortCodeCounter++;
  return code;
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

// POST endpoint to shorten a URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Check if URL already exists
  for (const [code, mappedUrl] of urlMap.entries()) {
    if (mappedUrl === url) {
      return res.json({ shortUrl: `http://localhost:${PORT}/${code}`, shortCode: code });
    }
  }

  const shortCode = generateShortCode();
  urlMap.set(shortCode, url);

  res.json({
    shortUrl: `http://localhost:${PORT}/${shortCode}`,
    shortCode,
    originalUrl: url
  });
});

// GET endpoint to redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const originalUrl = urlMap.get(shortCode);

  if (!originalUrl) {
    return res.status(404).html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>URL Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
          h1 { color: #e74c3c; margin: 0; }
          p { color: #666; }
          a { color: #667eea; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>404 - URL Not Found</h1>
          <p>The short URL doesn't exist or has expired.</p>
          <a href="/">← Go back to shortener</a>
        </div>
      </body>
      </html>
    `);
  }

  res.redirect(originalUrl);
});

// GET endpoint to check API health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
