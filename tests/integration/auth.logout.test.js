'use strict';

const {
  getApp,
  resetStore,
  register,
  logout,
  validUser,
} = require('../helpers');

let app;

beforeAll(() => { app = getApp(); });
beforeEach(() => { resetStore(); });

describe('POST /api/auth/logout', () => {
  test('200 { ok: true } and clears both auth cookies', async () => {
    const reg = await register(app, validUser());
    const cookiesBefore = reg.headers['set-cookie'] || [];
    expect(cookiesBefore.map((c) => c.split('=')[0])).toEqual(
      expect.arrayContaining(['access_token', 'refresh_token'])
    );

    const res = await logout(app);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const clearCookies = res.headers['set-cookie'] || [];
    // Express sets clear-cookie with an empty value and an expiration in the past.
    expect(clearCookies.length).toBeGreaterThanOrEqual(2);
    const allClear = clearCookies.every((c) => /access_token|refresh_token/.test(c));
    expect(allClear).toBe(true);
  });

  test('logout is idempotent and does not require authentication', async () => {
    const res = await logout(app);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});