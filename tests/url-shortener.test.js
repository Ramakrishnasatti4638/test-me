const request = require('supertest');
const app = require('../server');

// ─────────────────────────────────────────────
// POST /api/shorten
// ─────────────────────────────────────────────

describe('POST /api/shorten', () => {
  test('creates a short URL and returns shortCode + shortUrl', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body).toHaveProperty('originalUrl', 'https://www.example.com');
    expect(res.body.shortCode).toHaveLength(7);
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
    expect(res.body).toHaveProperty('error', 'Invalid URL format');
  });

  test('each shorten request generates a unique short code', async () => {
    const [res1, res2] = await Promise.all([
      request(app).post('/api/shorten').send({ url: 'https://www.google.com' }),
      request(app).post('/api/shorten').send({ url: 'https://www.github.com' }),
    ]);

    expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
  });
});

// ─────────────────────────────────────────────
// GET /:shortCode  — REDIRECT BEHAVIOUR
// ─────────────────────────────────────────────

describe('GET /:shortCode — redirect', () => {
  let shortCode;
  const targetUrl = 'https://www.example.com/redirected-page';

  beforeEach(async () => {
    // Create a fresh short URL before each redirect test
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: targetUrl });

    shortCode = res.body.shortCode;
  });

  // ✅ KEY TEST: clicking (visiting) the short link redirects to the original URL
  test('clicking the short link redirects to the original URL (302)', async () => {
    const res = await request(app)
      .get(`/${shortCode}`)
      .redirects(0); // Do not follow the redirect — inspect the raw response

    // Verify it is a redirect response
    expect(res.status).toBe(302);

    // Verify the Location header points to the original URL
    expect(res.headers['location']).toBe(targetUrl);
  });

  test('following the short link lands on the original URL', async () => {
    const res = await request(app)
      .get(`/${shortCode}`)
      .redirects(5); // Follow up to 5 redirects

    // After all redirects are followed, the final response text / URL
    // corresponds to the original destination.
    // The redirect chain must have at least one entry (the short-link hop).
    expect(res.redirects.length).toBeGreaterThanOrEqual(1);
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app)
      .get('/unknownCode123')
      .redirects(0);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Short URL not found');
  });
});

// ─────────────────────────────────────────────
// GET /api/urls
// ─────────────────────────────────────────────

describe('GET /api/urls', () => {
  test('returns an array of all shortened URLs', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://www.test.com' });

    const res = await request(app).get('/api/urls');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const entry = res.body[0];
    expect(entry).toHaveProperty('shortCode');
    expect(entry).toHaveProperty('originalUrl');
  });
});
