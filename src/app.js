'use strict';

const path = require('path');
const express = require('express');
const { UrlStore } = require('./store');

/**
 * Validate that a string is an absolute http(s) URL.
 * @param {unknown} value
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
 * Build the Express application. Accepts a store so tests can inject a fresh one.
 * @param {{ store?: UrlStore }} [options]
 */
function createApp(options = {}) {
  const store = options.store || new UrlStore();
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Create a short link.
  app.post('/api/shorten', (req, res) => {
    const { url } = req.body || {};
    if (!isValidHttpUrl(url)) {
      return res
        .status(400)
        .json({ error: 'Please provide a valid http(s) URL.' });
    }
    const { code } = store.create(url.trim());
    const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;
    return res.status(201).json({ code, url: url.trim(), shortUrl });
  });

  // Redirect a short code to its original URL.
  app.get('/:code', (req, res, next) => {
    const target = store.resolve(req.params.code);
    if (!target) return next();
    return res.redirect(302, target);
  });

  // 404 fallback.
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.locals.store = store;
  return app;
}

module.exports = { createApp, isValidHttpUrl };
