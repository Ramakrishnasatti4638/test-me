const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear the store before each test to ensure isolation
beforeEach(() => {
  Object.keys(urlStore).forEach((key) => delete urlStore[key]);
});

// ─────────────────────────────────────────────────────────────
// POST /api/shorten
// ─────────────────────────────────────────────────────────────
describe('POST /api/shorten', () => {
  test('returns 201 with a shortCode and shortUrl for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.shortUrl).toMatch(/^\/r\//);
  });

  test('returns 400 when no URL is provided', async () => {
    const res = await request(app).post('/api/shorten').send({});

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

  test('stores the mapping in the URL store', async () => {
    const originalUrl = 'https://www.github.com';
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const { shortCode } = res.body;
    expect(urlStore[shortCode]).toBe(originalUrl);
  });

  test('generates unique short codes for different URLs', async () => {
    const res1 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.google.com' });
    const res2 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.github.com' });

    expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /r/:code  — REDIRECT (core feature)
// ─────────────────────────────────────────────────────────────
describe('GET /r/:code — clicking a short link redirects to the original URL', () => {
  test('clicking a short link redirects (302) to the original URL', async () => {
    // Step 1: shorten a URL
    const originalUrl = 'https://www.openai.com';
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    expect(shortenRes.status).toBe(201);
    const { shortUrl } = shortenRes.body;

    // Step 2: "click" the short link — follow the /r/:code path
    const redirectRes = await request(app).get(shortUrl);

    // Step 3: assert it redirects with 302 to the correct destination
    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers['location']).toBe(originalUrl);
  });

  test('clicking a short link with a trailing slash still redirects correctly', async () => {
    const originalUrl = 'https://www.wikipedia.org/';
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const { shortUrl } = shortenRes.body;
    const redirectRes = await request(app).get(shortUrl);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers['location']).toBe(originalUrl);
  });

  test('returns 404 when clicking an unknown / expired short link', async () => {
    const res = await request(app).get('/r/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/urls
// ─────────────────────────────────────────────────────────────
describe('GET /api/urls', () => {
  test('returns an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('lists all shortened URLs with shortCode, shortUrl and originalUrl', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://www.nasa.gov' });
    await request(app).post('/api/shorten').send({ url: 'https://www.spacex.com' });

    const res = await request(app).get('/api/urls');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    res.body.forEach((entry) => {
      expect(entry).toHaveProperty('shortCode');
      expect(entry).toHaveProperty('shortUrl');
      expect(entry).toHaveProperty('originalUrl');
    });
  });
});
