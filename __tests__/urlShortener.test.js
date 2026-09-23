const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear the store before each test to keep tests independent
beforeEach(() => {
  Object.keys(urlStore).forEach((key) => delete urlStore[key]);
});

// ─── POST /api/shorten ────────────────────────────────────────────────────────

describe('POST /api/shorten', () => {
  test('returns 201 with a code and shortUrl for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('code');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.shortUrl).toMatch(/^\//);
  });

  test('stores the original URL under the generated code', async () => {
    const originalUrl = 'https://www.openai.com';
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const { code } = res.body;
    expect(urlStore[code]).toBe(originalUrl);
  });

  test('generates a unique code for each URL', async () => {
    const res1 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    const res2 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res1.body.code).not.toBe(res2.body.code);
  });

  test('returns 400 when URL is missing', async () => {
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

  test('returns 400 when url is not a string', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 12345 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── GET /:code — Redirect ────────────────────────────────────────────────────

describe('GET /:code — redirect behaviour', () => {
  test('redirects (302) to the original URL when clicking a short link', async () => {
    // Step 1: create a short URL
    const originalUrl = 'https://www.github.com';
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    expect(shortenRes.status).toBe(201);
    const { code } = shortenRes.body;

    // Step 2: click the short link — expect a 302 redirect to the original URL
    const redirectRes = await request(app).get(`/${code}`);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers['location']).toBe(originalUrl);
  });

  test('redirects to the correct URL for multiple different short links', async () => {
    const urls = [
      'https://www.google.com',
      'https://www.wikipedia.org',
      'https://www.mozilla.org',
    ];

    // Shorten all three
    const codes = await Promise.all(
      urls.map((url) =>
        request(app).post('/api/shorten').send({ url }).then((r) => r.body.code)
      )
    );

    // Clicking each short link should redirect to its specific original URL
    for (let i = 0; i < codes.length; i++) {
      const res = await request(app).get(`/${codes[i]}`);
      expect(res.status).toBe(302);
      expect(res.headers['location']).toBe(urls[i]);
    }
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/unknownXYZ');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── GET /api/urls ────────────────────────────────────────────────────────────

describe('GET /api/urls', () => {
  test('returns an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('lists all shortened URLs with code, originalUrl, and shortUrl', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    const res = await request(app).get('/api/urls');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('code');
    expect(res.body[0]).toHaveProperty('originalUrl', 'https://www.example.com');
    expect(res.body[0]).toHaveProperty('shortUrl');
  });
});
