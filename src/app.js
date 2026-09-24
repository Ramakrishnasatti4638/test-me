const path = require('path');
const express = require('express');
const UrlStore = require('./store');

/**
 * Basic URL validation. Only http(s) URLs are accepted so that
 * short links can never be used to inject javascript: or data: URIs.
 */
function normalizeUrl(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return null;
  }
  let candidate = raw.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `http://${candidate}`;
  }
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch (err) {
    return null;
  }
}

function createApp() {
  const app = express();
  const store = new UrlStore();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Create a short link.
  app.post('/api/shorten', (req, res) => {
    const url = normalizeUrl(req.body && req.body.url);
    if (!url) {
      return res.status(400).json({ error: 'A valid http(s) URL is required.' });
    }
    const code = store.save(url);
    const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;
    return res.status(201).json({ code, url, shortUrl });
  });

  // Redirect a short link to its original URL.
  app.get('/:code', (req, res, next) => {
    const url = store.resolve(req.params.code);
    if (!url) {
      return next();
    }
    return res.redirect(302, url);
  });

  // Expose the store for tests.
  app.locals.store = store;

  return app;
}

module.exports = createApp;
