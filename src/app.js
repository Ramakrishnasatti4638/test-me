"use strict";

const path = require("path");
const express = require("express");
const { nanoid } = require("nanoid");

/**
 * Creates and configures the URL shortener Express app.
 *
 * The store is passed in (defaults to an in-memory Map) so tests can inspect
 * or seed it directly.
 *
 * @param {Map<string, string>} [store] - code -> original URL mapping
 * @returns {import('express').Express}
 */
function createApp(store = new Map()) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve the frontend.
  app.use(express.static(path.join(__dirname, "..", "public")));

  /**
   * Validate that a string is a usable http(s) URL.
   * @param {string} value
   * @returns {boolean}
   */
  function isValidHttpUrl(value) {
    if (typeof value !== "string" || value.trim() === "") return false;
    let parsed;
    try {
      parsed = new URL(value);
    } catch (_err) {
      return false;
    }
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  }

  // Create a short link.
  app.post("/api/shorten", (req, res) => {
    const { url } = req.body || {};

    if (!isValidHttpUrl(url)) {
      return res
        .status(400)
        .json({ error: "A valid http(s) URL is required." });
    }

    // Reuse an existing code if this URL was already shortened.
    for (const [code, target] of store.entries()) {
      if (target === url) {
        return res.status(200).json({
          code,
          shortUrl: `${req.protocol}://${req.get("host")}/${code}`,
          url: target,
        });
      }
    }

    let code = nanoid(7);
    while (store.has(code)) {
      code = nanoid(7);
    }
    store.set(code, url);

    return res.status(201).json({
      code,
      shortUrl: `${req.protocol}://${req.get("host")}/${code}`,
      url,
    });
  });

  // List all short links (used by the UI).
  app.get("/api/links", (req, res) => {
    const links = Array.from(store.entries()).map(([code, url]) => ({
      code,
      url,
      shortUrl: `${req.protocol}://${req.get("host")}/${code}`,
    }));
    res.json({ links });
  });

  // Redirect a short code to its original URL.
  app.get("/:code", (req, res, next) => {
    const { code } = req.params;
    const target = store.get(code);

    if (!target) {
      return next();
    }

    return res.redirect(302, target);
  });

  // Fallback 404 for unknown short codes.
  app.use((req, res) => {
    res.status(404).json({ error: "Short link not found." });
  });

  return app;
}

module.exports = { createApp };
