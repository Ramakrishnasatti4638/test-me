const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear the store before each test to keep them isolated
beforeEach(() => {
  urlStore.clear();
});

// ─────────────────────────────────────────────
// POST /api/shorten
// ─────────────────────────────────────────────
describe('POST /api/shorten', () => {
  test('returns 201 and a short URL for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.shortUrl).toMatch(/\/[A-Za-z0-9_-]{7}$/);
  });

  test('returns 400 when no URL is provided', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 400 for an invalid URL format', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-valid-url' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('each call generates a unique short code', async () => {
    const [res1, res2] = await Promise.all([
      request(app).post('/api/shorten').send({ url: 'https://www.google.com' }),
      request(app).post('/api/shorten').send({ url: 'https://www.github.com' }),
    ]);

    expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
  });
});

// ─────────────────────────────────────────────
// GET /:code  — REDIRECT
// ─────────────────────────────────────────────
describe('GET /:code (redirect)', () => {
  test('clicking a short link redirects (302) to the original URL', async () => {
    // Step 1 – shorten a URL
    const target = 'https://www.openai.com';
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: target });

    expect(shortenRes.status).toBe(201);
    const { shortCode } = shortenRes.body;

    // Step 2 – follow the short link (simulates clicking the link)
    const redirectRes = await request(app).get(`/${shortCode}`);

    // Should receive a 302 redirect pointing to the original URL
    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers['location']).toBe(target);
  });

  test('short link for a long URL redirects correctly', async () => {
    const longUrl = 'https://en.wikipedia.org/wiki/URL_shortening?utm_source=test&utm_medium=jest';
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: longUrl });

    const redirectRes = await request(app).get(`/${body.shortCode}`);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers['location']).toBe(longUrl);
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/unknownXYZ');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('multiple different short links all redirect to their respective targets', async () => {
    const urls = [
      'https://www.google.com',
      'https://www.github.com',
      'https://www.stackoverflow.com',
    ];

    // Shorten all URLs
    const codes = await Promise.all(
      urls.map(url =>
        request(app).post('/api/shorten').send({ url }).then(r => ({
          code: r.body.shortCode,
          expected: url,
        }))
      )
    );

    // Verify each redirect
    for (const { code, expected } of codes) {
      const res = await request(app).get(`/${code}`);
      expect(res.status).toBe(302);
      expect(res.headers['location']).toBe(expected);
    }
  });
});
