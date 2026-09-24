'use strict';

const { nanoid } = require('nanoid');

/**
 * A tiny in-memory URL store. Keys are short codes, values are the
 * original long URLs plus some lightweight metadata.
 */
class UrlStore {
  constructor() {
    this.byCode = new Map();
  }

  /**
   * Save a long URL and return its record. If the same URL was already
   * shortened, the existing record is returned so codes stay stable.
   */
  save(longUrl, codeFactory = nanoid) {
    for (const record of this.byCode.values()) {
      if (record.longUrl === longUrl) {
        return record;
      }
    }

    let code;
    do {
      code = codeFactory(7);
    } while (this.byCode.has(code));

    const record = { code, longUrl, clicks: 0, createdAt: new Date().toISOString() };
    this.byCode.set(code, record);
    return record;
  }

  get(code) {
    return this.byCode.get(code);
  }

  recordClick(code) {
    const record = this.byCode.get(code);
    if (record) {
      record.clicks += 1;
    }
    return record;
  }

  all() {
    return Array.from(this.byCode.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
}

module.exports = { UrlStore };
