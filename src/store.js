'use strict';

const { nanoid } = require('nanoid');

/**
 * In-memory store mapping short codes to their original URLs.
 * Kept intentionally simple; swap for a real database in production.
 */
class UrlStore {
  constructor() {
    this._byCode = new Map();
  }

  /**
   * Create (or reuse) a short code for the given URL.
   * @param {string} url absolute http(s) URL
   * @returns {{ code: string, url: string }}
   */
  create(url) {
    for (const [code, stored] of this._byCode.entries()) {
      if (stored === url) return { code, url };
    }
    let code = nanoid(7);
    while (this._byCode.has(code)) code = nanoid(7);
    this._byCode.set(code, url);
    return { code, url };
  }

  /**
   * Resolve a short code back to its original URL.
   * @param {string} code
   * @returns {string | undefined}
   */
  resolve(code) {
    return this._byCode.get(code);
  }

  clear() {
    this._byCode.clear();
  }
}

module.exports = { UrlStore };
