const express = require('express');
const path = require('path');
const { customAlphabet } = require('nanoid');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'links.json');

// URL-safe alphabet (no ambiguous chars like 0/O/1/l/I)
const nanoid = customAlphabet('23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ', 7);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Persistence helpers -----------------------------------------------------
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{}', 'utf8');
}

function readLinks() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return {};
  }
}

function writeLinks(links) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2), 'utf8');
}

// --- Validation --------------------------------------------------------------
function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidSlug(slug) {
  return typeof slug === 'string' && /^[A-Za-z0-9_-]{3,32}$/.test(slug);
}

// --- API routes --------------------------------------------------------------
app.post('/api/shorten', (req, res) => {
  const { url, slug } = req.body || {};

  if (!url || typeof url !== 'string' || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Please provide a valid http(s) URL.' });
  }

  const links = readLinks();

  let code;
  if (slug) {
    if (!isValidSlug(slug)) {
      return res.status(400).json({
        error: 'Custom slug must be 3-32 characters, letters, digits, "-" or "_" only.',
      });
    }
    if (links[slug]) {
      return res.status(409).json({ error: 'That custom slug is already taken.' });
    }
    code = slug;
  } else {
    // Generate a code that doesn't already exist
    do {
      code = nanoid();
    } while (links[code]);
  }

  const now = new Date().toISOString();
  links[code] = {
    url,
    createdAt: now,
    clicks: 0,
  };
  writeLinks(links);

  res.status(201).json({
    code,
    shortUrl: `${req.protocol}://${req.get('host')}/${code}`,
    url,
    createdAt: now,
  });
});

app.get('/api/links', (_req, res) => {
  const links = readLinks();
  const base = `${_req.protocol}://${_req.get('host')}`;
  const list = Object.entries(links)
    .map(([code, info]) => ({
      code,
      shortUrl: `${base}/${code}`,
      url: info.url,
      createdAt: info.createdAt,
      clicks: info.clicks || 0,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json({ count: list.length, links: list });
});

app.get('/api/links/:code', (req, res) => {
  const links = readLinks();
  const info = links[req.params.code];
  if (!info) return res.status(404).json({ error: 'Short link not found.' });
  res.json({
    code: req.params.code,
    url: info.url,
    createdAt: info.createdAt,
    clicks: info.clicks || 0,
  });
});

app.delete('/api/links/:code', (req, res) => {
  const links = readLinks();
  if (!links[req.params.code]) return res.status(404).json({ error: 'Short link not found.' });
  delete links[req.params.code];
  writeLinks(links);
  res.json({ ok: true });
});

// --- Redirect (must come after API routes) -----------------------------------
app.get('/:code', (req, res, next) => {
  // Don't hijack the frontend's own paths
  if (req.params.code === 'api' || req.params.code === 'index.html') return next();

  const links = readLinks();
  const info = links[req.params.code];
  if (!info) {
    return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }
  info.clicks = (info.clicks || 0) + 1;
  links[req.params.code] = info;
  writeLinks(links);
  res.redirect(302, info.url);
});

app.listen(PORT, () => {
  console.log(`URL shortener listening on http://localhost:${PORT}`);
});
