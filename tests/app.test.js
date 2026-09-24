'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const { UrlStore } = require('../src/store');

let store;
let app;

beforeEach(() => {
  store = new UrlStore();
  app = createApp(store);
});

describe('POST /api/shorten', () => {
  test('creates a short link for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/some/long/path' });

    expect(res.status).toBe(201);
    expect(res.body.code).toBeTruthy();
    expect(res.body.shortUrl).toContain(res.body.code);
    expect(res.body.url).toBe('https://example.com/some/long/path');
  });

  test('rejects a missing URL', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  test('rejects an invalid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-real-url' });
    expect(res.status).toBe(400);
  });

  test('returns the same code for a repeated URL', async () => {
    const first = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/repeat' });
    const second = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/repeat' });

    expect(second.body.code).toBe(first.body.code);
  });
});

describe('GET /:code — clicking a short link redirects', () => {
  test('redirects to the original URL when the short link is clicked', async () => {
    // Arrange: create a short link (this is what the user gets in the UI).
    const original = 'https://example.com/target/page';
    const created = await request(app)
      .post('/api/shorten')
      .send({ url: original });
    const { code } = created.body;

    // Act: "click" the short link by requesting /:code.
    const res = await request(app).get(`/${code}`);

    // Assert: the server issues a redirect to the original URL.
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(original);
  });

  test('following the redirect lands on the original URL', async () => {
    const original = 'https://example.com/final';
    const created = await request(app)
      .post('/api/shorten')
      .send({ url: original });

    // supertest's .redirects(1) follows the Location header, simulating a browser.
    const res = await request(app).get(`/${created.body.code}`).redirects(1);
    expect(res.request.url).toBe(original);
  });

  test('counts each click as a hit', async () => {
    const created = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/counted' });
    const { code } = created.body;

    await request(app).get(`/${code}`);
    await request(app).get(`/${code}`);

    const stats = await request(app).get(`/api/stats/${code}`);
    expect(stats.body.hits).toBe(2);
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});
