'use strict';

const {
  getApp,
  resetStore,
  register,
  validUser,
} = require('../helpers');

let app;

beforeAll(() => { app = getApp(); });
beforeEach(() => { resetStore(); });

describe('POST /api/auth/register', () => {
  test('201: creates a user, returns sanitized user + tokens + sets HttpOnly cookies', async () => {
    const res = await register(app, validUser());

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: 'alice@example.com',
      name: 'Alice',
    });
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(res.body.user).not.toHaveProperty('password');
    expect(typeof res.body.user.id).toBe('string');
    expect(res.body.user.id.length).toBeGreaterThan(0);
    expect(typeof res.body.user.createdAt).toBe('string');

    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body.accessToken.split('.').length).toBe(3); // JWT shape
    expect(typeof res.body.refreshToken).toBe('string');

    const cookies = res.headers['set-cookie'] || [];
    const cookieNames = cookies.map((c) => c.split('=')[0]);
    expect(cookieNames).toEqual(expect.arrayContaining(['access_token', 'refresh_token']));
    const accessCookie = cookies.find((c) => c.startsWith('access_token='));
    expect(accessCookie).toMatch(/HttpOnly/i);
    expect(accessCookie).toMatch(/SameSite=Lax/i);
  });

  test('201: email is normalized to lowercase', async () => {
    const res = await register(app, validUser({ email: '  Alice@Example.COM  ' }));
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('alice@example.com');
  });

  test('409 EMAIL_TAKEN when the email already exists (case-insensitive)', async () => {
    await register(app, validUser());
    const res = await register(app, validUser({ email: 'ALICE@example.com' }));
    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: 'EMAIL_TAKEN', message: expect.any(String) },
    });
  });

  test('400 VALIDATION_ERROR when email is missing', async () => {
    const res = await register(app, validUser({ email: '' }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('400 VALIDATION_ERROR when email is not an email', async () => {
    const res = await register(app, validUser({ email: 'not-an-email' }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('400 VALIDATION_ERROR when password is shorter than 8 characters', async () => {
    const res = await register(app, validUser({ password: 'short' }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('400 VALIDATION_ERROR when name is missing', async () => {
    const res = await register(app, validUser({ name: '' }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('400 VALIDATION_ERROR when name is too long', async () => {
    const res = await register(app, validUser({ name: 'x'.repeat(101) }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('400 BAD_JSON on malformed JSON', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{not json');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_JSON');
  });
});

// Inline `request` import to keep the malformed-JSON test self-contained.
const request = require('supertest');