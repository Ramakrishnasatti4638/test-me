const { nanoid } = require('nanoid');

/**
 * In-memory store mapping short codes to original URLs.
 * Kept deliberately simple; swap for a database in production.
 */
class UrlStore {
  constructor() {
    this.codeToUrl = new Map();
    this.urlToCode = new Map();
  }

  /**
   * Save a URL and return its short code. If the URL was already
   * shortened, the existing code is returned (idempotent).
   */
  save(url) {
    if (this.urlToCode.has(url)) {
      return this.urlToCode.get(url);
    }
    let code = nanoid(7);
    while (this.codeToUrl.has(code)) {
      code = nanoid(7);
    }
    this.codeToUrl.set(code, url);
    this.urlToCode.set(url, code);
    return code;
  }

  resolve(code) {
    return this.codeToUrl.get(code);
  }

  clear() {
    this.codeToUrl.clear();
    this.urlToCode.clear();
  }
}

module.exports = UrlStore;
