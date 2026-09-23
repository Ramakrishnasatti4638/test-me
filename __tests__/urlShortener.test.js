const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear store before each test for isolation
beforeEach(() => urlStore.clear());

// ─────────────────────────────────────────────
// POST /api/shorten
// ─────────────────────────────────────────────
describe('POST /api/shorten', () => {
  test('returns 201 with a shortUrl for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com/some/long/path' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body).toHaveProperty('code');
    expect(res.body.originalUrl).toBe('https://www.example.com/some/long/path');
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
    expect(res.body.error).toMatch(/invalid url/i);
  });

  test('generates a unique code for each shortened URL', async () => {
    const res1 = await request(app).post('/api/shorten').send({ url: 'https://site-a.com' });
    const res2 = await request(app).post('/api/shorten').send({ url: 'https://site-b.com' });

    expect(res1.body.code).not.toBe(res2.body.code);
  });
});

// ─────────────────────────────────────────────
// GET /api/links
// ─────────────────────────────────────────────
describe('GET /api/links', () => {
  test('returns an empty array when no links exist', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all shortened links after creation', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://alpha.com' });
    await request(app).post('/api/shorten').send({ url: 'https://beta.com' });

    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const originals = res.body.map((l) => l.originalUrl);
    expect(originals).toContain('https://alpha.com');
    expect(originals).toContain('https://beta.com');
  });
});

// ─────────────────────────────────────────────
// GET /:code  — Redirect (the "click" test)
// ─────────────────────────────────────────────
describe('GET /:code — short link redirect', () => {
  test('clicking a short link redirects (302) to the original URL', async () => {
    // Step 1 — shorten a URL
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.openai.com/' });

    expect(shortenRes.status).toBe(201);
    const { code } = shortenRes.body;

    // Step 2 — "click" the short link (follow: false keeps the redirect visible)
    const redirectRes = await request(app)
      .get(`/${code}`)
      .redirects(0); // do NOT follow the redirect — inspect it directly

    // Assert redirect behaviour
    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.location).toBe('https://www.openai.com/');
  });

  test('following the short link lands on the correct destination', async () => {
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.google.com/' });

    const { code } = shortenRes.body;

    // redirects(5) tells supertest to follow up to 5 redirects
    const finalRes = await request(app)
      .get(`/${code}`)
      .redirects(5);

    // The final resolved URL should be google.com (supertest follows internally)
    expect(finalRes.redirects.length).toBeGreaterThanOrEqual(1);
    expect(finalRes.redirects[0]).toContain('google.com');
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/unknownCode123').redirects(0);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('short link stores and retrieves the exact original URL', async () => {
    const originalUrl = 'https://github.com/openai/openai-node?tab=readme-ov-file#usage';

    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const { code } = shortenRes.body;

    const redirectRes = await request(app).get(`/${code}`).redirects(0);
    expect(redirectRes.headers.location).toBe(originalUrl);
  });
});
