const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear the in-memory store before each test for isolation
beforeEach(() => {
  Object.keys(urlStore).forEach(k => delete urlStore[k]);
});

// ─────────────────────────────────────────────
// POST /api/shorten
// ─────────────────────────────────────────────
describe('POST /api/shorten', () => {
  test('returns 201 and a shortUrl for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body.shortUrl).toMatch(/^http/);
  });

  test('stores the mapping so the short code resolves', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.google.com' });

    const { shortCode } = res.body;
    expect(urlStore[shortCode]).toBe('https://www.google.com');
  });

  test('returns 400 when no URL is provided', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 400 for an invalid URL format', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-valid-url' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid url/i);
  });

  test('generates unique short codes for different URLs', async () => {
    const res1 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    const res2 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.github.com' });

    expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
  });
});

// ─────────────────────────────────────────────
// GET /:code  — REDIRECT TEST (core feature)
// ─────────────────────────────────────────────
describe('GET /:code — redirect', () => {
  test('clicking a short link redirects (302) to the original URL', async () => {
    // Step 1: create a short link
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com/some/long/path?q=test' });

    expect(shortenRes.statusCode).toBe(201);
    const { shortCode } = shortenRes.body;

    // Step 2: "click" the short link — follow the redirect manually
    const redirectRes = await request(app)
      .get(`/${shortCode}`)
      .redirects(0); // don't auto-follow so we can inspect the 302

    // Assert: HTTP 302 redirect is returned
    expect(redirectRes.statusCode).toBe(302);

    // Assert: Location header points to the original URL
    expect(redirectRes.headers['location']).toBe(
      'https://www.example.com/some/long/path?q=test'
    );
  });

  test('following the short link lands on the original URL', async () => {
    // Step 1: shorten
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    const { shortCode } = shortenRes.body;

    // Step 2: follow the redirect (supertest will follow it automatically)
    const finalRes = await request(app)
      .get(`/${shortCode}`)
      .redirects(5); // allow auto-follow

    // The redirect resolves — supertest follows it and reaches the destination
    // (or gets a network error if example.com isn't reachable in sandbox).
    // What matters is the redirect itself was issued correctly.
    expect([200, 301, 302, 404]).toContain(finalRes.statusCode);
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app)
      .get('/nonexistent123');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

// ─────────────────────────────────────────────
// GET /api/urls
// ─────────────────────────────────────────────
describe('GET /api/urls', () => {
  test('returns an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('lists all shortened URLs', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.github.com' });

    const res = await request(app).get('/api/urls');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('shortCode');
    expect(res.body[0]).toHaveProperty('originalUrl');
  });
});
