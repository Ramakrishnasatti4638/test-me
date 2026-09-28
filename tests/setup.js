'use strict';

// Test env must be set before any module reads config.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-not-for-production-1234567890';
// Make bcrypt cheap so the suite finishes in seconds, not minutes.
process.env.BCRYPT_ROUNDS = '4';
// Disable rate-limit at the source so individual test files don't trip the
// 20-requests/15-min limit. We still keep one dedicated test that re-enables
// the limiter to verify the response shape.
process.env.RATE_LIMIT_MAX = '100000';
// Make sure no real user file gets created during tests.
process.env.USER_STORE = 'memory';

// eslint-disable-next-line no-console
console.log('[jest-setup] NODE_ENV=test, BCRYPT_ROUNDS=4, RATE_LIMIT_MAX=100000');
