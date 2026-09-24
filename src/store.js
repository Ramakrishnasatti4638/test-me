'use strict';

/**
 * A minimal in-memory store mapping short codes to original URLs.
 * Kept separate from the Express app so it is easy to reset in tests.
 */
class UrlStore {
  constructor() {
    this.codeToUrl = new Map();
    this.urlToCode = new Map();
    this.hits = new Map();
  }

  /** Save a URL under a given code (or return the existing code if already stored). */
  save(code, url) {
    if (this.urlToCode.has(url)) {
      return this.urlToCode.get(url);
    }
    this.codeToUrl.set(code, url);
    this.urlToCode.set(url, code);
    this.hits.set(code, 0);
    return code;
  }

  /** Look up the original URL for a code, or undefined if unknown. */
  resolve(code) {
    return this.codeToUrl.get(code);
  }

  /** Increment and return the visit count for a code. */
  recordHit(code) {
    const next = (this.hits.get(code) || 0) + 1;
    this.hits.set(code, next);
    return next;
  }

  getHits(code) {
    return this.hits.get(code) || 0;
  }

  clear() {
    this.codeToUrl.clear();
    this.urlToCode.clear();
    this.hits.clear();
  }
}

module.exports = { UrlStore };
