'use strict';

require('dotenv').config();

const required = (name, fallback) => {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
};

const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  // JWT
  jwt: Object.freeze({
    secret: required('JWT_SECRET', 'dev-only-change-me-in-production-please'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  }),

  // Bcrypt cost factor (10-12 is a sane default; 12 takes ~250ms on modern CPUs)
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Rate-limit on auth endpoints
  rateLimit: Object.freeze({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),                // 20 req / window / IP
  }),

  // User store: 'memory' (default, dev) or 'file' (persisted JSON)
  userStore: process.env.USER_STORE || 'memory',
  userFile: process.env.USER_FILE || '.data/users.json',
});

module.exports = config;