'use strict';

const path = require('path');
const express = require('express');
const {
  db,
  isValidCode,
  isValidUrl,
  createUniqueCode,
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const insertStmt = db.prepare(
  'INSERT INTO links (code, url) VALUES (?, ?)'
);
const findByCodeStmt = db.prepare(
  'SELECT code, url, clicks, created_at, last_clicked_at FROM links WHERE code = ?'
);
const listAllStmt = db.prepare(
  'SELECT code, url, clicks, created_at, last_clicked_at FROM links ORDER BY id DESC LIMIT 200'
);
const incrementClicksStmt = db.prepare(
  "UPDATE links SET clicks = clicks + 1, last_clicked_at = datetime('now') WHERE code = ?"
);
const deleteByCodeStmt = db.prepare(
  'DELETE FROM links WHERE code = ?'
);

// POST /api/shorten — create a short URL
app.post('/api/shorten', (req, res) => {
  const { url, code } = req.body || {};

  if (typeof url !== 'string' || !isValidUrl(url)) {
    return res.status(400).json({ error: 'A valid http(s) URL is required' });
  }

  let finalCode = null;
  if (typeof code === 'string' && code.length > 0) {
    if (!isValidCode(code)) {
      return res.status(400).json({
        error: 'Custom code must be 1–32 chars: letters, digits, _ or -',
      });
    }
    const existing = findByCodeStmt.get(code);
    if (existing) {
      return res.status(409).json({ error: 'That custom code is already taken' });
    }
    finalCode = code;
  } else {
    finalCode = createUniqueCode();
  }

  try {
    insertStmt.run(finalCode, url);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save link' });
  }

  const row = findByCodeStmt.get(finalCode);
  res.status(201).json(row);
});

// GET /api/links — list all links
app.get('/api/links', (_req, res) => {
  const rows = listAllStmt.all();
  res.json(rows);
});

// GET /api/links/:code — fetch one link's details
app.get('/api/links/:code', (req, res) => {
  const { code } = req.params;
  if (!isValidCode(code)) {
    return res.status(400).json({ error: 'Invalid code' });
  }
  const row = findByCodeStmt.get(code);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// DELETE /api/links/:code — delete a short link
app.delete('/api/links/:code', (req, res) => {
  const { code } = req.params;
  if (!isValidCode(code)) {
    return res.status(400).json({ error: 'Invalid code' });
  }
  const result = deleteByCodeStmt.run(code);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.status(204).end();
});

// GET /:code — redirect to original URL
app.get('/:code', (req, res, next) => {
  const { code } = req.params;

  // Skip API/static paths just in case
  if (code === 'api' || code === 'favicon.ico') return next();

  if (!isValidCode(code)) {
    return res.status(400).send('Invalid short code');
  }

  const row = findByCodeStmt.get(code);
  if (!row) {
    return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }

  incrementClicksStmt.run(code);
  res.redirect(301, row.url);
});

// SPA fallback for any non-API GET that isn't a short code
app.get(/^\/(?!api\/|favicon\.ico).*/, (req, res, next) => {
  // If we got here, the path didn't match a short code and isn't an API/static asset.
  // Let static middleware handle /index.html or send it.
  next();
});

// 404 handler for unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`URL shortener listening on port ${PORT}`);
  });
}

module.exports = app;