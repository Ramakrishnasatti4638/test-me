'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');

describe('URL shortener', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test('creates a short link for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/some/very/long/path' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('code');
    expect(res.body.url).toBe('https://example.com/some/very/long/path');
    expect(res.body.shortUrl).toContain(`/${res.body.code}`);
  });

  test('rejects an invalid URL', async () => {
    const res = await request(app).post('/api/shorten').send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('rejects a missing URL', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
  });

  // The key case: clicking a short link redirects to the original URL.
  test('redirects a short link to the original URL when clicked', async () => {
    const target = 'https://example.com/destination-page';

    const created = await request(app).post('/api/shorten').send({ url: target });
    const { code } = created.body;

    // Simulate a user clicking the short link (GET /:code).
    const clicked = await request(app).get(`/${code}`);

    expect(clicked.status).toBe(302);
    expect(clicked.headers.location).toBe(target);
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });

  test('counts clicks each time a short link is followed', async () => {
    const created = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/counted' });
    const { code } = created.body;

    await request(app).get(`/${code}`);
    await request(app).get(`/${code}`);

    const list = await request(app).get('/api/links');
    const link = list.body.find((l) => l.code === code);
    expect(link.clicks).toBe(2);
  });

  test('reuses the same code for a duplicate URL', async () => {
    const url = 'https://example.com/dedupe';
    const first = await request(app).post('/api/shorten').send({ url });
    const second = await request(app).post('/api/shorten').send({ url });
    expect(second.body.code).toBe(first.body.code);
  });
});
