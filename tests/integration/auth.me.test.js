'use strict';

const request = require('supertest');

const {
  getApp,
  resetStore,
  register,
  login,
  me,
  validUser,
} = require('../helpers');

let app;

beforeAll(() => { app = getApp(); });
beforeEach(async () => {
  resetStore();
  await register(app, validUser());
});

describe('GET /api/auth/me', () => {
  test('200 with Bearer token returns the profile', async () => {
    const reg = await register(app, validUser({ email: 'eve@example.com', name: 'Eve' }));
    const res = await me(app, reg.body.accessToken);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('eve@example.com');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  test('200 with HttpOnly cookie (no Authorization header)', async () => {
    const loginRes = await login(app, {
      email: 'alice@example.com',
      password: 'correct horse battery staple',
    });
    const cookies = loginRes.headers['set-cookie'];
    const cookieHeader = cookies.map((c) => c.split(';')[0]).join('; ');

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('alice@example.com');
  });

  test('200: round-trip through register → /me works end to end', async () => {
    const reg = await register(app, validUser({ email: 'bob@example.com', name: 'Bob' }));
    const res = await me(app, reg.body.accessToken);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: 'bob@example.com', name: 'Bob' });
    expect(res.body.user.id).toBe(reg.body.user.id);
  });

  test('401 UNAUTHENTICATED when no Authorization header and no cookie', async () => {
    const res = await me(app, null);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  test('401 UNAUTHENTICATED when Authorization header has wrong scheme', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Basic dXNlcjpwYXNz');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  test('401 INVALID_TOKEN for a malformed token', async () => {
    const res = await me(app, 'not.a.jwt');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  test('401 INVALID_TOKEN for a token signed with the wrong secret', async () => {
    const jwt = require('jsonwebtoken');
    const bad = jwt.sign({ sub: 'u-test', email: 'x' }, 'definitely-not-the-right-secret', {
      issuer: 'login-backend',
      expiresIn: '15m',
    });
    const res = await me(app, bad);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  test('401 INVALID_TOKEN when a refresh token is presented at /me', async () => {
    const reg = await register(app, validUser({ email: 'carol@example.com', name: 'Carol' }));
    const res = await me(app, reg.body.refreshToken);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  test('404 NOT_FOUND when the JWT is valid but the user was deleted', async () => {
    const store = require('../../src/models/user.model');
    const reg = await register(app, validUser({ email: 'dave@example.com', name: 'Dave' }));
    const userId = reg.body.user.id;
    store.byId.delete(userId);
    store.byEmail.delete('dave@example.com');

    const res = await me(app, reg.body.accessToken);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});