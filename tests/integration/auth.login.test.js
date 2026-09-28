'use strict';

const {
  getApp,
  resetStore,
  register,
  login,
  validUser,
} = require('../helpers');

let app;

beforeAll(() => { app = getApp(); });
beforeEach(async () => {
  resetStore();
  await register(app, validUser());
});

describe('POST /api/auth/login', () => {
  test('200: returns sanitized user + tokens on correct credentials', async () => {
    const res = await login(app, { email: 'alice@example.com', password: 'correct horse battery staple' });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: 'alice@example.com', name: 'Alice' });
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
  });

  test('200: email match is case-insensitive', async () => {
    const res = await login(app, { email: 'ALICE@EXAMPLE.COM', password: 'correct horse battery staple' });
    expect(res.status).toBe(200);
  });

  test('200: sets HttpOnly access_token and refresh_token cookies', async () => {
    const res = await login(app, { email: 'alice@example.com', password: 'correct horse battery staple' });
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.map((c) => c.split('=')[0])).toEqual(
      expect.arrayContaining(['access_token', 'refresh_token'])
    );
    expect(cookies.find((c) => c.startsWith('access_token='))).toMatch(/HttpOnly/i);
  });

  test('401 INVALID_CREDENTIALS: identical envelope for unknown email and wrong password (no enumeration)', async () => {
    const unknown = await login(app, { email: 'nobody@example.com', password: 'whatever12' });
    const wrongPw = await login(app, { email: 'alice@example.com', password: 'whatever12' });

    expect(unknown.status).toBe(401);
    expect(wrongPw.status).toBe(401);
    expect(unknown.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(wrongPw.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(unknown.body.error.message).toBe(wrongPw.body.error.message);
  });

  test('400 VALIDATION_ERROR when email is missing', async () => {
    const res = await login(app, { email: '', password: 'whatever12' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('400 VALIDATION_ERROR when password is missing', async () => {
    const res = await login(app, { email: 'alice@example.com', password: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('400 VALIDATION_ERROR when email is not an email', async () => {
    const res = await login(app, { email: 'nope', password: 'whatever12' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});