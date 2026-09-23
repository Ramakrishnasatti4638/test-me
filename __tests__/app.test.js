const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear store before each test to ensure isolation
beforeEach(() => {
  Object.keys(urlStore).forEach(k => delete urlStore[k]);
});

// ─── POST /api/shorten ────────────────────────────────────────────────────────

describe('POST /api/shorten', () => {
  test('returns 201 and a shortCode for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.shortUrl).toMatch(/^\/r\//);
  });

  test('stores the original URL under the returned short code', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.github.com' });

    const { shortCode } = res.body;
    expect(urlStore[shortCode]).toBe('https://www.github.com');
  });

  test('returns 400 when URL is missing', async () => {
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

  test('generates a unique code each time', async () => {
    const res1 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });
    const res2 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
  });
});

// ─── GET /r/:code — REDIRECT TEST ─────────────────────────────────────────────

describe('GET /r/:code — redirect behaviour', () => {
  test('clicking a short link redirects (301) to the original URL', async () => {
    // Step 1: shorten a URL
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.openai.com' });

    expect(shortenRes.status).toBe(201);
    const { shortUrl } = shortenRes.body;

    // Step 2: follow the short link — should receive a redirect response
    const redirectRes = await request(app)
      .get(shortUrl)
      .redirects(0); // don't auto-follow so we can assert on the redirect itself

    expect(redirectRes.status).toBe(301);
    expect(redirectRes.headers.location).toBe('https://www.openai.com');
  });

  test('following the short link resolves at the original URL', async () => {
    // Step 1: shorten a URL
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.openai.com' });

    const { shortUrl } = shortenRes.body;

    // Step 2: follow redirect automatically (supertest default)
    // supertest follows redirects by default; the final response location should match
    const directRes = await request(app)
      .get(shortUrl)
      .redirects(0);

    // Confirm the Location header points to the destination
    expect(directRes.headers.location).toBe('https://www.openai.com');
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/r/unknown123');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── GET /api/urls ─────────────────────────────────────────────────────────────

describe('GET /api/urls', () => {
  test('returns an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('lists all shortened URLs with code, shortUrl, and originalUrl', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.google.com' });

    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('code');
    expect(res.body[0]).toHaveProperty('shortUrl');
    expect(res.body[0].originalUrl).toBe('https://www.google.com');
  });
});
