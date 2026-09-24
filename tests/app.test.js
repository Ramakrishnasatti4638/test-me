const request = require('supertest');
const createApp = require('../src/app');

let app;

beforeEach(() => {
  app = createApp();
});

describe('URL shortener API', () => {
  test('POST /api/shorten returns a short link for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/some/very/long/path' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('code');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.url).toBe('https://example.com/some/very/long/path');
  });

  test('POST /api/shorten rejects an invalid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'javascript:alert(1)' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/shorten is idempotent for the same URL', async () => {
    const first = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/repeat' });
    const second = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/repeat' });

    expect(first.body.code).toBe(second.body.code);
  });

  // The key scenario: clicking a short link redirects to the original URL.
  test('clicking a short link redirects (302) to the original URL', async () => {
    const original = 'https://example.com/target-page';

    const created = await request(app)
      .post('/api/shorten')
      .send({ url: original });
    const { code } = created.body;

    // Simulate the browser following the short link.
    const clicked = await request(app).get(`/${code}`);

    expect(clicked.status).toBe(302);
    expect(clicked.headers.location).toBe(original);
  });

  test('unknown short code does not redirect', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});
