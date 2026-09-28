'use strict';

const request = require('supertest');
const { getApp } = require('../helpers');

let app;

beforeAll(() => { app = getApp(); });

describe('app middleware', () => {
  test('GET /health → 200 { ok: true, env: "test" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, env: 'test' });
  });

  test('Unknown route → 404 NOT_FOUND with envelope shape', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: expect.stringContaining('Route GET /nope not found'),
      },
    });
  });

  test('Unknown POST route → 404 NOT_FOUND with method in message', async () => {
    const res = await request(app).post('/no/such/thing').send({});
    expect(res.status).toBe(404);
    expect(res.body.error.message).toMatch(/POST \/no\/such\/thing/);
  });

  test('Helmet headers are present on every response', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['referrer-policy']).toBeDefined();
    // CSP is on by default in helmet v7
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  test('JSON body limit is enforced — payload over 100kb is rejected', async () => {
    const huge = 'x'.repeat(110 * 1024);
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ email: 'big@example.com', password: huge, name: 'Big' }));

    expect(res.status).toBe(413); // PayloadTooLarge
  });
});