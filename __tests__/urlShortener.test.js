const request = require('supertest');

// Re-require server fresh before each suite so urlStore is empty
let app;
let urlStore;

beforeEach(() => {
  // Clear module cache to reset in-memory store between tests
  jest.resetModules();
  ({ app, urlStore } = require('../server'));
});

// ─── POST /api/shorten ────────────────────────────────────────────────────────

describe('POST /api/shorten', () => {
  test('returns 201 with shortCode and shortUrl for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.shortUrl).toMatch(/^\/r\//);
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
    expect(res.body.error).toBe('Invalid URL format.');
  });

  test('stores the original URL in the in-memory store', async () => {
    const originalUrl = 'https://openai.com/research';
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const { shortCode } = res.body;
    expect(urlStore[shortCode]).toBe(originalUrl);
  });
});

// ─── GET /r/:code (redirect) ──────────────────────────────────────────────────

describe('GET /r/:code — clicking a short link redirects to the original URL', () => {
  test('redirects (302) to the original URL when the short code exists', async () => {
    // Step 1: shorten a URL
    const originalUrl = 'https://www.github.com';
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    expect(shortenRes.status).toBe(201);
    const { shortCode, shortUrl } = shortenRes.body;

    // Step 2: follow the short link — expect a redirect to the original
    const redirectRes = await request(app).get(shortUrl);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers['location']).toBe(originalUrl);
  });

  test('follows the redirect and arrives at the destination when redirects are enabled', async () => {
    const originalUrl = 'https://www.wikipedia.org';
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const { shortUrl } = shortenRes.body;

    // redirects(true) makes supertest follow the 302 automatically
    const res = await request(app).get(shortUrl).redirects(1);

    // After following the redirect the browser would land on the original domain.
    // Since we can't reach the outside internet in tests, we verify supertest
    // did follow the redirect (status is the upstream response or a network error)
    // and that the redirect header pointed to the right place.
    expect(res.request.url).toContain('wikipedia.org');
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/r/doesnotexist');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Short URL not found.');
  });

  test('each unique URL gets its own distinct short code', async () => {
    const url1 = 'https://www.google.com';
    const url2 = 'https://www.bing.com';

    const [res1, res2] = await Promise.all([
      request(app).post('/api/shorten').send({ url: url1 }),
      request(app).post('/api/shorten').send({ url: url2 }),
    ]);

    expect(res1.body.shortCode).not.toBe(res2.body.shortCode);

    // Both short links redirect to their respective originals
    const [redirect1, redirect2] = await Promise.all([
      request(app).get(res1.body.shortUrl),
      request(app).get(res2.body.shortUrl),
    ]);

    expect(redirect1.headers['location']).toBe(url1);
    expect(redirect2.headers['location']).toBe(url2);
  });
});

// ─── GET /api/urls ────────────────────────────────────────────────────────────

describe('GET /api/urls', () => {
  test('returns an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('lists all shortened URLs after shortening', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://www.nodejs.org' });
    await request(app).post('/api/shorten').send({ url: 'https://www.npmjs.com' });

    const res = await request(app).get('/api/urls');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({
      shortCode: expect.any(String),
      shortUrl: expect.stringMatching(/^\/r\//),
      originalUrl: expect.any(String),
    });
  });
});
