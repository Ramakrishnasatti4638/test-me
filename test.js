import test from 'node:test';
import assert from 'node:assert';
import { createServer } from 'http';
import express from 'express';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create app instance for testing
function createApp() {
  const app = express();
  const urlMap = new Map();

  app.use(express.json());

  // API: Shorten URL
  app.post('/api/shorten', (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

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

  // API: Redirect
  app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const originalUrl = urlMap.get(shortCode);

    if (!originalUrl) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.redirect(originalUrl);
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

  return { app, urlMap };
}

test('URL Shortener - Create and Redirect Flow', async (t) => {
  const { app, urlMap } = createApp();
  const server = createServer(app);

  // Start server on a random port
  await new Promise((resolve) => {
    server.listen(0, () => {
      resolve();
    });
  });

  const address = server.address();
  const baseUrl = `http://localhost:${address.port}`;

  try {
    // Test 1: Shorten a URL
    await t.test('should create a shortened URL', async () => {
      const originalUrl = 'https://example.com/very/long/url/path?param=value';

      const response = await fetch(`${baseUrl}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: originalUrl }),
      });

      assert.strictEqual(response.status, 200);

      const data = await response.json();
      assert(data.shortCode, 'Should have a short code');
      assert(data.shortUrl, 'Should have a short URL');
      assert.strictEqual(data.originalUrl, originalUrl, 'Original URL should match');
    });

    // Test 2: Redirect to original URL
    await t.test('should redirect short URL to original URL', async () => {
      const originalUrl = 'https://github.com/openai/gpt-3';

      // First, create a shortened URL
      const shortenResponse = await fetch(`${baseUrl}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: originalUrl }),
      });

      const shortenData = await shortenResponse.json();
      const shortCode = shortenData.shortCode;

      // Now, visit the short URL and verify redirect
      const redirectResponse = await fetch(`${baseUrl}/${shortCode}`, {
        redirect: 'manual', // Don't follow redirects automatically
      });

      // Should return 302 (redirect)
      assert.strictEqual(
        redirectResponse.status,
        302,
        `Expected redirect status 302, got ${redirectResponse.status}`
      );

      // Check the Location header
      const location = redirectResponse.headers.get('location');
      assert.strictEqual(
        location,
        originalUrl,
        `Expected redirect to ${originalUrl}, got ${location}`
      );
    });

    // Test 3: Invalid URL format
    await t.test('should reject invalid URLs', async () => {
      const response = await fetch(`${baseUrl}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'not-a-valid-url' }),
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert(data.error, 'Should have error message');
    });

    // Test 4: Missing URL
    await t.test('should require a URL', async () => {
      const response = await fetch(`${baseUrl}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.strictEqual(data.error, 'URL is required');
    });

    // Test 5: Non-existent short code
    await t.test('should return 404 for non-existent short code', async () => {
      const response = await fetch(`${baseUrl}/nonexistent`, {
        redirect: 'manual',
      });

      assert.strictEqual(response.status, 404);
    });

    // Test 6: Multiple URLs create different short codes
    await t.test('should create unique short codes for different URLs', async () => {
      const urls = [
        'https://example.com/path1',
        'https://example.com/path2',
        'https://example.com/path3',
      ];

      const shortCodes = [];

      for (const url of urls) {
        const response = await fetch(`${baseUrl}/api/shorten`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        const data = await response.json();
        shortCodes.push(data.shortCode);
      }

      // All short codes should be unique
      const uniqueCodes = new Set(shortCodes);
      assert.strictEqual(
        uniqueCodes.size,
        shortCodes.length,
        'All short codes should be unique'
      );
    });

  } finally {
    server.close();
  }
});
