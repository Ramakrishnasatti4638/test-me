const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear the in-memory store before each test to keep tests independent
beforeEach(() => {
  Object.keys(urlStore).forEach(key => delete urlStore[key]);
});

// ─── Shorten endpoint ────────────────────────────────────────────────────────

describe('POST /api/shorten', () => {
  test('returns 201 with shortCode and shortUrl for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.originalUrl).toBe('https://www.example.com');
    expect(res.body.shortCode).toHaveLength(6);
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
    const res1 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.google.com' });

    const res2 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.github.com' });

    expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
  });
});

// ─── Redirect endpoint ───────────────────────────────────────────────────────

describe('GET /:shortCode — redirect behaviour', () => {
  test('clicking a short link redirects (301) to the original URL', async () => {
    // Step 1: shorten a URL
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com/some/long/path?q=test' });

    expect(shortenRes.status).toBe(201);
    const { shortCode } = shortenRes.body;

    // Step 2: follow the short link — simulates clicking the link
    const redirectRes = await request(app).get(`/${shortCode}`);

    expect(redirectRes.status).toBe(301);
    expect(redirectRes.headers.location).toBe(
      'https://www.example.com/some/long/path?q=test'
    );
  });

  test('clicking a short link with a different URL redirects correctly', async () => {
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.openai.com' });

    const { shortCode } = shortenRes.body;

    const redirectRes = await request(app).get(`/${shortCode}`);

    expect(redirectRes.status).toBe(301);
    expect(redirectRes.headers.location).toBe('https://www.openai.com');
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── List endpoint ───────────────────────────────────────────────────────────

describe('GET /api/urls', () => {
  test('returns an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all shortened URLs', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://www.example.com' });
    await request(app).post('/api/shorten').send({ url: 'https://www.github.com' });

    const res = await request(app).get('/api/urls');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach(item => {
      expect(item).toHaveProperty('shortCode');
      expect(item).toHaveProperty('shortUrl');
      expect(item).toHaveProperty('originalUrl');
    });
  });
});
