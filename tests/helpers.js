'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');

// Resolve a fresh app per test. Because the user model is a singleton Map in
// memory, every test file gets a clean module graph via Jest's `isolateModules`
// (or by clearing the Map in `beforeEach`).
function getApp() {
  return require('../src/app');
}

function getUserStore() {
  return require('../src/models/user.model');
}

/** Wipe the in-memory user store between tests. */
function resetStore() {
  const store = getUserStore();
  store.byId.clear();
  store.byEmail.clear();
}

/** A self-contained, valid token that won't have to round-trip through login. */
function makeAccessToken({ sub = 'u-test', email = 't@example.com' } = {}) {
  return jwt.sign({ sub, email }, process.env.JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'login-backend',
  });
}

const register = (app, payload) =>
  request(app).post('/api/auth/register').send(payload);

const login = (app, payload) =>
  request(app).post('/api/auth/login').send(payload);

const me = (app, token) =>
  request(app)
    .get('/api/auth/me')
    .set('Authorization', token ? `Bearer ${token}` : '');

const logout = (app) => request(app).post('/api/auth/logout');

const validUser = (overrides = {}) => ({
  email: 'alice@example.com',
  password: 'correct horse battery staple',
  name: 'Alice',
  ...overrides,
});

module.exports = {
  getApp,
  getUserStore,
  resetStore,
  makeAccessToken,
  register,
  login,
  me,
  logout,
  validUser,
};