const request = require('supertest');
const app = require('../app');
const store = require('../store');

// Reset in-memory store before each test to ensure isolation
beforeEach(() => {
  store.clear();
});

// ─────────────────────────────────────────────
// POST /api/shorten
// ─────────────────────────────────────────────
describe('POST /api/shorten', () => {
  test('returns 201 with code and shortUrl for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('code');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.originalUrl).toBe('https://www.example.com');
    expect(res.body.code).toHaveLength(7);
  });

  test('returns 400 when url is missing', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 400 for an invalid URL (no protocol)', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-valid-url' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid url/i);
  });

  test('each shorten call generates a unique code', async () => {
    const res1 = await request(app).post('/api/shorten').send({ url: 'https://a.com' });
    const res2 = await request(app).post('/api/shorten').send({ url: 'https://b.com' });

    expect(res1.body.code).not.toBe(res2.body.code);
  });
});

// ─────────────────────────────────────────────
// GET /:code  — redirect behaviour
// ─────────────────────────────────────────────
describe('GET /:code — redirect when clicking a short link', () => {
  test('clicking a short link redirects (301) to the original URL', async () => {
    // Step 1: create a short link
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.github.com' });

    expect(shortenRes.status).toBe(201);
    const { code } = shortenRes.body;

    // Step 2: "click" the short link — follow the redirect manually
    const redirectRes = await request(app).get(`/${code}`);

    // The server must respond with a 301 Moved Permanently
    expect(redirectRes.status).toBe(301);
    // Location header must point to the original URL
    expect(redirectRes.headers.location).toBe('https://www.github.com');
  });

  test('clicking a short link increments the click counter', async () => {
    const { body: { code } } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.openai.com' });

    // Click twice
    await request(app).get(`/${code}`);
    await request(app).get(`/${code}`);

    const linksRes = await request(app).get('/api/links');
    const link = linksRes.body.find(l => l.code === code);
    expect(link.clicks).toBe(2);
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/unknownCode123');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
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

  test('returns all created links', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://foo.com' });
    await request(app).post('/api/shorten').send({ url: 'https://bar.com' });

    const res = await request(app).get('/api/links');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const urls = res.body.map(l => l.originalUrl);
    expect(urls).toContain('https://foo.com');
    expect(urls).toContain('https://bar.com');
  });

  test('each link entry includes code, originalUrl, createdAt and clicks', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://test.com' });

    const res = await request(app).get('/api/links');
    const link = res.body[0];

    expect(link).toHaveProperty('code');
    expect(link).toHaveProperty('originalUrl');
    expect(link).toHaveProperty('createdAt');
    expect(link).toHaveProperty('clicks');
  });
});
