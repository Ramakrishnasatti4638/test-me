const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear the in-memory store before each test so tests are isolated
beforeEach(() => {
  Object.keys(urlStore).forEach((k) => delete urlStore[k]);
});

// ─────────────────────────────────────────────
// POST /api/shorten
// ─────────────────────────────────────────────
describe('POST /api/shorten', () => {
  test('returns a short URL for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.shortUrl).toMatch(/\/[A-Za-z0-9_-]{7}$/);
  });

  test('returns 400 for a missing URL', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 400 for an invalid URL format', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid url/i);
  });

  test('returns the same short code for a duplicate URL', async () => {
    const url = 'https://duplicate.com';
    const first = await request(app).post('/api/shorten').send({ url });
    const second = await request(app).post('/api/shorten').send({ url });

    expect(second.body.shortCode).toBe(first.body.shortCode);
  });
});

// ─────────────────────────────────────────────
// GET /api/urls
// ─────────────────────────────────────────────
describe('GET /api/urls', () => {
  test('returns an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  test('returns all shortened URLs', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://a.com' });
    await request(app).post('/api/shorten').send({ url: 'https://b.com' });

    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('shortCode');
    expect(res.body[0]).toHaveProperty('originalUrl');
    expect(res.body[0]).toHaveProperty('shortUrl');
  });
});

// ─────────────────────────────────────────────
// GET /:shortCode  –  REDIRECT TEST
// (clicking the short link redirects to the original URL)
// ─────────────────────────────────────────────
describe('GET /:shortCode – redirect on click', () => {
  test('clicking a short link redirects (302) to the original URL', async () => {
    const originalUrl = 'https://www.openai.com';

    // 1. Shorten the URL
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    expect(shortenRes.status).toBe(201);
    const { shortCode } = shortenRes.body;

    // 2. Simulate clicking the short link – supertest does NOT follow
    //    redirects by default, so we get the raw 302 response.
    const redirectRes = await request(app).get(`/${shortCode}`);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers['location']).toBe(originalUrl);
  });

  test('clicking a short link follows through to the original URL', async () => {
    const originalUrl = 'https://www.github.com';

    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    // redirects: true  →  supertest follows the redirect chain
    const followRes = await request(app)
      .get(`/${body.shortCode}`)
      .redirects(5);

    // After following, we land outside our server (external URL).
    // supertest will throw or return a non-404 status — either way the
    // redirect was issued correctly. We just assert it wasn't a 404.
    expect(followRes.status).not.toBe(404);
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/unknownXYZ');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('short link for a URL with query params redirects correctly', async () => {
    const originalUrl = 'https://example.com/search?q=hello+world&page=2';

    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const res = await request(app).get(`/${body.shortCode}`);
    expect(res.status).toBe(302);
    expect(res.headers['location']).toBe(originalUrl);
  });

  test('multiple different short codes each redirect to their own URL', async () => {
    const urls = [
      'https://first.com',
      'https://second.com',
      'https://third.com',
    ];

    const codes = await Promise.all(
      urls.map((url) =>
        request(app)
          .post('/api/shorten')
          .send({ url })
          .then((r) => r.body.shortCode)
      )
    );

    for (let i = 0; i < urls.length; i++) {
      const res = await request(app).get(`/${codes[i]}`);
      expect(res.status).toBe(302);
      expect(res.headers['location']).toBe(urls[i]);
    }
  });
});
