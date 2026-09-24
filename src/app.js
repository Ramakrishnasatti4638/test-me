'use strict';

const path = require('path');
const express = require('express');
const { nanoid } = require('nanoid');
const { UrlStore } = require('./store');

/** Validate that a string is a well-formed http(s) URL. */
function isValidHttpUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch (err) {
    return false;
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

/**
 * Build the Express application. A fresh store can be injected which makes
 * the app trivial to test in isolation.
 */
function createApp(store = new UrlStore()) {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Create a short link for a given URL.
  app.post('/api/shorten', (req, res) => {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'A "url" field is required.' });
    }
    if (!isValidHttpUrl(url)) {
      return res.status(400).json({ error: 'Please provide a valid http(s) URL.' });
    }

    const code = store.save(nanoid(7), url);
    const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;

    return res.status(201).json({ code, url, shortUrl });
  });

  // Return stats for a code (used by the UI / tests).
  app.get('/api/stats/:code', (req, res) => {
    const { code } = req.params;
    const url = store.resolve(code);
    if (!url) {
      return res.status(404).json({ error: 'Unknown short code.' });
    }
    return res.json({ code, url, hits: store.getHits(code) });
  });

  // Redirect a short code to its original URL. This is the behaviour exercised
  // by the "click on link -> redirect" test case.
  app.get('/:code', (req, res, next) => {
    const { code } = req.params;
    const url = store.resolve(code);
    if (!url) {
      return next();
    }
    store.recordHit(code);
    return res.redirect(302, url);
  });

  // Fallback 404 for anything unmatched.
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  return app;
}

module.exports = { createApp, isValidHttpUrl };
