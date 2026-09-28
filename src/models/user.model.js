'use strict';

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const config = require('../config');
const AppError = require('../utils/AppError');

/**
 * User model.
 *
 * Two backends are supported out of the box:
 *   - 'memory' (default) — fast Map-based store for dev / tests
 *   - 'file'             — JSON file persistence, suitable for single-process demos
 *
 * In production you'd swap this for Postgres / Mongo / etc. The interface
 * (findByEmail, create, verifyPassword, ...) is what the service layer talks to,
 * so swapping the backend is a one-file change.
 */
class UserStore {
  constructor() {
    this.byId = new Map();
    this.byEmail = new Map();
    this._ready = this._init();
  }

  async _init() {
    if (config.userStore === 'file') {
      const file = path.resolve(config.userFile);
      await fs.mkdir(path.dirname(file), { recursive: true });
      try {
        const raw = await fs.readFile(file, 'utf8');
        const list = JSON.parse(raw);
        for (const u of list) {
          this.byId.set(u.id, u);
          this.byEmail.set(u.email.toLowerCase(), u);
        }
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
    }
  }

  async _persist() {
    if (config.userStore !== 'file') return;
    const list = [...this.byId.values()];
    await fs.writeFile(
      path.resolve(config.userFile),
      JSON.stringify(list, null, 2),
      { mode: 0o600 }
    );
  }

  async findByEmail(email) {
    await this._ready;
    return this.byEmail.get(String(email).toLowerCase().trim()) || null;
  }

  async findById(id) {
    await this._ready;
    return this.byId.get(id) || null;
  }

  async create({ email, password, name }) {
    await this._ready;

    const normalizedEmail = String(email).toLowerCase().trim();
    if (this.byEmail.has(normalizedEmail)) {
      throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    const user = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name: String(name).trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    this.byId.set(user.id, user);
    this.byEmail.set(user.email, user);
    await this._persist();

    return this.sanitize(user);
  }

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.passwordHash);
  }

  sanitize(user) {
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

module.exports = new UserStore();