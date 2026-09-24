'use strict';

const { nanoid } = require('nanoid');

/**
 * In-memory store mapping short codes to their target URLs.
 * Kept intentionally simple; swap for a database in production.
 */
class UrlStore {
  constructor() {
    this._byCode = new Map();
    this._byUrl = new Map();
  }

  /**
   * Create (or reuse) a short code for the given URL.
   * @param {string} url - a valid http(s) URL
   * @returns {{ code: string, url: string, created: boolean }}
   */
  shorten(url) {
    if (this._byUrl.has(url)) {
      const code = this._byUrl.get(url);
      return { code, url, created: false };
    }
    let code = nanoid(7);
    while (this._byCode.has(code)) {
      code = nanoid(7);
    }
    this._byCode.set(code, { url, clicks: 0, createdAt: Date.now() });
    this._byUrl.set(url, code);
    return { code, url, created: true };
  }

  /** Resolve a code to its record, incrementing the click counter. */
  resolve(code) {
    const record = this._byCode.get(code);
    if (!record) return null;
    record.clicks += 1;
    return record;
  }

  /** Look up a record without counting a click. */
  peek(code) {
    return this._byCode.get(code) || null;
  }

  /** List all links, newest first. */
  list() {
    return [...this._byCode.entries()]
      .map(([code, r]) => ({ code, url: r.url, clicks: r.clicks, createdAt: r.createdAt }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
}

module.exports = { UrlStore };
