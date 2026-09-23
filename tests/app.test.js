const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

// Clear the in-memory store before each test so tests are isolated
beforeEach(() => {
  store.clear();
});

// ─────────────────────────────────────────────
// POST /api/shorten
// ─────────────────────────────────────────────
describe('POST /api/shorten', () => {
  test('returns 201 with a code and shortUrl for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('code');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.shortUrl).toMatch(/^\/r\//);
  });

  test('returns 400 when url field is missing', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 400 for an invalid (non-URL) string', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-valid-url' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid URL');
  });

  test('generated short code is 7 characters long', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://openai.com' });

    expect(res.body.code).toHaveLength(7);
  });
});

// ─────────────────────────────────────────────
// GET /r/:code  — REDIRECT TEST (core feature)
// ─────────────────────────────────────────────
describe('GET /r/:code — redirect on click', () => {
  test('clicking a short link redirects (302) to the original URL', async () => {
    // Step 1: create a short URL
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.github.com' });

    expect(shortenRes.statusCode).toBe(201);
    const { code, shortUrl } = shortenRes.body;

    // Step 2: "click" the short link — expect a 302 redirect to the original
    const redirectRes = await request(app).get(shortUrl);

    expect(redirectRes.statusCode).toBe(302);
    expect(redirectRes.headers['location']).toBe('https://www.github.com');
  });

  test('clicking the short link increments the click counter', async () => {
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.wikipedia.org' });

    const { code, shortUrl } = body;

    // Click twice
    await request(app).get(shortUrl);
    await request(app).get(shortUrl);

    const listRes = await request(app).get('/api/urls');
    const entry = listRes.body.find((u) => u.code === code);

    expect(entry.clicks).toBe(2);
  });

  test('clicking an unknown short code returns 404', async () => {
    const res = await request(app).get('/r/XXXXXXX');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('redirect works with a URL that has query params and path', async () => {
    const originalUrl = 'https://www.google.com/search?q=url+shortener&hl=en';

    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const redirectRes = await request(app).get(body.shortUrl);

    expect(redirectRes.statusCode).toBe(302);
    expect(redirectRes.headers['location']).toBe(originalUrl);
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

  test('lists all shortened URLs with code, originalUrl, clicks', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://apple.com' });
    await request(app).post('/api/shorten').send({ url: 'https://mozilla.org' });

    const res = await request(app).get('/api/urls');

    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('code');
    expect(res.body[0]).toHaveProperty('originalUrl');
    expect(res.body[0]).toHaveProperty('clicks');
  });
});
