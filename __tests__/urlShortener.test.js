const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear store before each test to ensure isolation
beforeEach(() => {
  Object.keys(urlStore).forEach(k => delete urlStore[k]);
});

// ──────────────────────────────────────────────
// POST /api/shorten
// ──────────────────────────────────────────────
describe('POST /api/shorten', () => {
  test('returns a short code and shortUrl for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(200);
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
    expect(res.body.error).toMatch(/invalid url/i);
  });

  test('returns the same short code when the same URL is shortened twice', async () => {
    const url = 'https://www.duplicate.com';

    const first = await request(app).post('/api/shorten').send({ url });
    const second = await request(app).post('/api/shorten').send({ url });

    expect(first.body.shortCode).toBe(second.body.shortCode);
  });
});

// ──────────────────────────────────────────────
// GET /r/:code  — REDIRECT (the key test case)
// ──────────────────────────────────────────────
describe('GET /r/:code — redirect when clicking a short link', () => {
  test('clicking a short link redirects (302) to the original URL', async () => {
    // Step 1: create the short URL
    const originalUrl = 'https://www.openai.com';
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    expect(shortenRes.status).toBe(200);
    const { shortUrl } = shortenRes.body;

    // Step 2: simulate clicking the short link — expect a redirect
    const redirectRes = await request(app)
      .get(shortUrl)
      .redirects(0); // do NOT follow the redirect so we can inspect it

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.location).toBe(originalUrl);
  });

  test('following a short link lands on the original destination', async () => {
    const originalUrl = 'https://www.github.com';
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const { shortUrl } = shortenRes.body;

    // supertest with redirects(1) follows the redirect and reports the final Location
    const followRes = await request(app)
      .get(shortUrl)
      .redirects(1);

    // The redirect Location header must point to the original URL
    // (some hosts append a trailing slash, so we normalize before comparing)
    const normalize = u => u.replace(/\/$/, '');
    expect(normalize(followRes.redirects[0])).toBe(normalize(originalUrl));
  });

  test('returns 404 when a non-existent short code is accessed', async () => {
    const res = await request(app).get('/r/doesnotexist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('different URLs produce different short codes', async () => {
    const res1 = await request(app).post('/api/shorten').send({ url: 'https://www.google.com' });
    const res2 = await request(app).post('/api/shorten').send({ url: 'https://www.bing.com' });

    expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
  });
});

// ──────────────────────────────────────────────
// GET /api/urls
// ──────────────────────────────────────────────
describe('GET /api/urls', () => {
  test('returns an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('lists all shortened URLs with correct shape', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://www.amazon.com' });
    await request(app).post('/api/shorten').send({ url: 'https://www.netflix.com' });

    const res = await request(app).get('/api/urls');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    res.body.forEach(item => {
      expect(item).toHaveProperty('shortCode');
      expect(item).toHaveProperty('originalUrl');
      expect(item).toHaveProperty('shortUrl');
    });
  });
});

// ──────────────────────────────────────────────
// DELETE /api/urls/:code
// ──────────────────────────────────────────────
describe('DELETE /api/urls/:code', () => {
  test('deletes an existing short URL and makes it inaccessible', async () => {
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.todelete.com' });

    const delRes = await request(app).delete(`/api/urls/${body.shortCode}`);
    expect(delRes.status).toBe(200);

    // After deletion, clicking the link should return 404
    const followRes = await request(app).get(body.shortUrl).redirects(0);
    expect(followRes.status).toBe(404);
  });

  test('returns 404 when deleting a non-existent short code', async () => {
    const res = await request(app).delete('/api/urls/ghost123');
    expect(res.status).toBe(404);
  });
});
