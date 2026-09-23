const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear the store before each test to keep tests isolated
beforeEach(() => urlStore.clear());

// ─────────────────────────────────────────
// POST /api/shorten
// ─────────────────────────────────────────
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

  test('returns 400 for a malformed URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-valid-url' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('generates a unique short code each time', async () => {
    const res1 = await request(app).post('/api/shorten').send({ url: 'https://a.com' });
    const res2 = await request(app).post('/api/shorten').send({ url: 'https://b.com' });

    expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
  });
});

// ─────────────────────────────────────────
// GET /r/:code  — the redirect test
// ─────────────────────────────────────────
describe('GET /r/:code — redirect behaviour', () => {
  test('clicking the short link redirects (301) to the original URL', async () => {
    // Step 1: shorten a URL
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.google.com' });

    expect(shortenRes.status).toBe(201);
    const { shortUrl } = shortenRes.body;

    // Step 2: simulate clicking the short link — expect a redirect
    const redirectRes = await request(app).get(shortUrl);

    expect(redirectRes.status).toBe(301);
    expect(redirectRes.headers['location']).toBe('https://www.google.com');
  });

  test('clicking a short link with a deep path redirects correctly', async () => {
    const originalUrl = 'https://docs.example.com/guides/getting-started?tab=node#install';

    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const redirectRes = await request(app).get(body.shortUrl);

    expect(redirectRes.status).toBe(301);
    expect(redirectRes.headers['location']).toBe(originalUrl);
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/r/unknown');
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────
// GET /api/urls
// ─────────────────────────────────────────
describe('GET /api/urls', () => {
  test('returns an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('lists all shortened URLs with their codes and original URLs', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://first.com' });
    await request(app).post('/api/shorten').send({ url: 'https://second.com' });

    const res = await request(app).get('/api/urls');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    const originals = res.body.map(u => u.originalUrl);
    expect(originals).toContain('https://first.com');
    expect(originals).toContain('https://second.com');

    res.body.forEach(item => {
      expect(item).toHaveProperty('shortCode');
      expect(item).toHaveProperty('shortUrl');
      expect(item).toHaveProperty('originalUrl');
    });
  });
});
