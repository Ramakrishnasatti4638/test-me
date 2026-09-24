'use strict';

const path = require('path');
const express = require('express');
const { UrlStore } = require('./store');

/**
 * Validate that a string is a well-formed http(s) URL.
 * @param {string} value
 * @returns {boolean}
 */
function isValidHttpUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

/**
 * Build an Express app. The store is injectable to make testing easy.
 * @param {UrlStore} [store]
 */
function createApp(store = new UrlStore()) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Create a short link.
  app.post('/api/shorten', (req, res) => {
    const { url } = req.body || {};
    if (!isValidHttpUrl(url)) {
      return res.status(400).json({ error: 'A valid http(s) URL is required.' });
    }
    const result = store.shorten(url.trim());
    const shortUrl = `${req.protocol}://${req.get('host')}/${result.code}`;
    return res.status(201).json({ code: result.code, url: result.url, shortUrl });
  });

  // List all short links.
  app.get('/api/links', (_req, res) => {
    res.json(store.list());
  });

  // Redirect a short code to its target URL.
  app.get('/:code', (req, res, next) => {
    const { code } = req.params;
    const record = store.resolve(code);
    if (!record) return next();
    return res.redirect(302, record.url);
  });

  return app;
}

module.exports = { createApp, isValidHttpUrl };
