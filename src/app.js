'use strict';

const path = require('path');
const express = require('express');
const { UrlStore } = require('./store');

/**
 * Validate that a string is an http(s) URL we are willing to shorten.
 */
function isValidHttpUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch (err) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

/**
 * Build the Express app. A store can be injected for tests.
 */
function createApp(store = new UrlStore()) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Create a short link.
  app.post('/api/shorten', (req, res) => {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string' || !isValidHttpUrl(url.trim())) {
      return res.status(400).json({
        error: 'Please provide a valid http(s) URL.',
      });
    }

    const record = store.save(url.trim());
    const shortUrl = `${req.protocol}://${req.get('host')}/${record.code}`;
    return res.status(201).json({ ...record, shortUrl });
  });

  // List all short links (most recent first).
  app.get('/api/links', (req, res) => {
    const links = store.all().map((record) => ({
      ...record,
      shortUrl: `${req.protocol}://${req.get('host')}/${record.code}`,
    }));
    res.json(links);
  });

  // Redirect a short code to its original URL.
  app.get('/:code', (req, res, next) => {
    const { code } = req.params;
    const record = store.get(code);

    if (!record) {
      return next();
    }

    store.recordClick(code);
    return res.redirect(302, record.longUrl);
  });

  // Fallback 404 for unknown codes / routes.
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

module.exports = { createApp, isValidHttpUrl };
