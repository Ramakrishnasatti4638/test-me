import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { customAlphabet } from 'nanoid';
import QRCode from 'qrcode';
import { initDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export function createApp(dbInstance) {
  const app = express();
  const db = dbInstance || initDb();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Helper: validate URL
  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // API: Shorten URL
  app.post('/api/shorten', async (req, res) => {
    let { url, customCode, title } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format. Must be a valid HTTP or HTTPS address.' });
    }

    let code = customCode ? customCode.trim() : null;

    if (code) {
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(code)) {
        return res.status(400).json({
          error: 'Custom alias must be 3-20 alphanumeric characters, underscores, or hyphens only.'
        });
      }

      const existing = db.prepare('SELECT id FROM urls WHERE code = ?').get(code);
      if (existing) {
        return res.status(409).json({ error: 'Custom alias is already taken. Please choose another.' });
      }
    } else {
      let attempts = 0;
      do {
        code = nanoid();
        const existing = db.prepare('SELECT id FROM urls WHERE code = ?').get(code);
        if (!existing) break;
        attempts++;
      } while (attempts < 5);
    }

    const trimmedTitle = title && title.trim() ? title.trim().slice(0, 100) : null;

    const stmt = db.prepare(`
      INSERT INTO urls (code, original_url, title)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(code, url, trimmedTitle);
    const createdUrl = db.prepare('SELECT * FROM urls WHERE id = ?').get(result.lastInsertRowid);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${code}`;

    res.status(201).json({
      success: true,
      data: {
        ...createdUrl,
        shortUrl,
        qrCodeUrl: `/api/qr/${code}`
      }
    });
  });

  // API: Get recent URLs
  app.get('/api/urls', (req, res) => {
    const urls = db.prepare(`
      SELECT id, code, original_url, title, created_at, clicks, last_accessed
      FROM urls
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const mapped = urls.map(item => ({
      ...item,
      shortUrl: `${baseUrl}/${item.code}`,
      qrCodeUrl: `/api/qr/${item.code}`
    }));

    res.json({ urls: mapped });
  });

  // API: Get URL stats & click logs
  app.get('/api/stats/:code', (req, res) => {
    const { code } = req.params;
    const url = db.prepare('SELECT * FROM urls WHERE code = ?').get(code);

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const recentClicks = db.prepare(`
      SELECT accessed_at, referer, user_agent
      FROM clicks
      WHERE url_id = ?
      ORDER BY accessed_at DESC
      LIMIT 20
    `).all(url.id);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      ...url,
      shortUrl: `${baseUrl}/${url.code}`,
      qrCodeUrl: `/api/qr/${url.code}`,
      recentClicks
    });
  });

  // API: QR code generation
  app.get('/api/qr/:code', async (req, res) => {
    const { code } = req.params;
    const url = db.prepare('SELECT * FROM urls WHERE code = ?').get(code);

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const target = `${baseUrl}/${code}`;

    try {
      res.setHeader('Content-Type', 'image/png');
      const stream = await QRCode.toFileStream(res, target, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  });

  // API: Delete short URL
  app.delete('/api/urls/:code', (req, res) => {
    const { code } = req.params;
    const url = db.prepare('SELECT id FROM urls WHERE code = ?').get(code);

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    db.prepare('DELETE FROM clicks WHERE url_id = ?').run(url.id);
    db.prepare('DELETE FROM urls WHERE id = ?').run(url.id);

    res.json({ success: true, message: 'URL deleted successfully' });
  });

  // Redirect route: GET /:code
  app.get('/:code', (req, res) => {
    const { code } = req.params;

    // Skip static assets or reserved routes
    if (['api', 'favicon.ico', 'index.html', 'style.css', 'app.js'].includes(code)) {
      return res.status(404).send('Not found');
    }

    const item = db.prepare('SELECT * FROM urls WHERE code = ?').get(code);

    if (!item) {
      return res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
    }

    // Update click count & last accessed
    const referer = req.get('referer') || 'Direct / Bookmark';
    const userAgent = req.get('user-agent') || 'Unknown';

    db.prepare(`
      UPDATE urls
      SET clicks = clicks + 1, last_accessed = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(item.id);

    db.prepare(`
      INSERT INTO clicks (url_id, referer, user_agent)
      VALUES (?, ?, ?)
    `).run(item.id, referer, userAgent);

    res.redirect(item.original_url);
  });

  return app;
}
