const request = require('supertest');
const { app, urlStore } = require('../server');

// Reset the URL store before each test to keep tests isolated
beforeEach(() => {
  urlStore.clear();
});

// ─────────────────────────────────────────────
// POST /api/shorten
// ─────────────────────────────────────────────
describe('POST /api/shorten', () => {
  test('returns 201 with a shortUrl for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body).toHaveProperty('code');
    expect(res.body.shortUrl).toMatch(/\/r\/[A-Za-z0-9_-]{7}$/);
  });

  test('returns 400 when no URL is provided', async () => {
    const res = await request(app).post('/api/shorten').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 400 for a malformed URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-valid-url' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('generates a unique short code for each request', async () => {
    const url = 'https://www.example.com';
    const [res1, res2] = await Promise.all([
      request(app).post('/api/shorten').send({ url }),
      request(app).post('/api/shorten').send({ url }),
    ]);

    expect(res1.body.code).not.toBe(res2.body.code);
  });
});

// ─────────────────────────────────────────────
// GET /r/:code  — the redirect test
// ─────────────────────────────────────────────
describe('GET /r/:code — clicking a short link redirects to the original URL', () => {
  test('clicking the short link redirects (301) to the original URL', async () => {
    // Step 1: shorten a URL
    const original = 'https://www.openai.com';
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: original });

    expect(shortenRes.statusCode).toBe(201);
    const { code } = shortenRes.body;

    // Step 2: "click" the short link — follow the redirect
    const redirectRes = await request(app)
      .get(`/r/${code}`)
      .redirects(0); // capture the redirect response, don't follow it

    expect(redirectRes.statusCode).toBe(301);
    expect(redirectRes.headers.location).toBe(original);
  });

  test('following the short link lands on the correct destination', async () => {
    const original = 'https://www.github.com';
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: original });

    const { code } = shortenRes.body;

    // supertest with redirects(5) will follow the 301 chain;
    // the first entry in redirects[] is where the server told us to go
    const followRes = await request(app)
      .get(`/r/${code}`)
      .redirects(5);

    // The first redirect destination should start with the original URL
    // (external servers may append a trailing slash, so we use startsWith)
    expect(followRes.redirects[0]).toContain(original);
  });

  test('returns 404 when the short code does not exist', async () => {
    const res = await request(app).get('/r/nonexistent');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('different short codes redirect to their own original URLs', async () => {
    const url1 = 'https://www.google.com';
    const url2 = 'https://www.wikipedia.org';

    const [r1, r2] = await Promise.all([
      request(app).post('/api/shorten').send({ url: url1 }),
      request(app).post('/api/shorten').send({ url: url2 }),
    ]);

    const res1 = await request(app).get(`/r/${r1.body.code}`).redirects(0);
    const res2 = await request(app).get(`/r/${r2.body.code}`).redirects(0);

    expect(res1.headers.location).toBe(url1);
    expect(res2.headers.location).toBe(url2);
  });
});

// ─────────────────────────────────────────────
// Frontend static files
// ─────────────────────────────────────────────
describe('Static frontend', () => {
  test('serves the index page at /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('URL Shortener');
  });
});
