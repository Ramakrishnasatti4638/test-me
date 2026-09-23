const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear the store before each test to ensure isolation
beforeEach(() => {
  Object.keys(urlStore).forEach(k => delete urlStore[k]);
});

// ─── POST /api/shorten ────────────────────────────────────────────────────────

describe('POST /api/shorten', () => {
  test('creates a short URL and returns shortCode + shortUrl', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.shortUrl).toMatch(/^\/s\//);
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
    expect(res.body.error).toMatch(/invalid url/i);
  });

  test('each shortening produces a unique code', async () => {
    const r1 = await request(app).post('/api/shorten').send({ url: 'https://a.com' });
    const r2 = await request(app).post('/api/shorten').send({ url: 'https://b.com' });

    expect(r1.body.shortCode).not.toBe(r2.body.shortCode);
  });
});

// ─── GET /s/:code  — REDIRECT (the main click-to-redirect test) ───────────────

describe('GET /s/:code — clicking a short link redirects to the original URL', () => {
  test('redirects (302) to the original URL when a valid short code is clicked', async () => {
    // 1. Create a short URL
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.openai.com' });

    expect(shortenRes.status).toBe(201);
    const { shortUrl } = shortenRes.body;

    // 2. "Click" the short link — supertest follows no redirects by default,
    //    so we directly check the 302 + Location header (exactly what a browser does).
    const redirectRes = await request(app).get(shortUrl);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers['location']).toBe('https://www.openai.com');
  });

  test('clicking the short link for github.com redirects to github.com', async () => {
    // T4 — shorten github.com, click the link, verify redirect to github.com
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://github.com' });

    expect(shortenRes.status).toBe(201);
    const { shortUrl } = shortenRes.body;

    // Simulate a click: GET the short URL without following redirects
    const redirectRes = await request(app).get(shortUrl).redirects(0);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers['location']).toBe('https://github.com');
  });

  test('redirects to the correct destination for multiple different short links', async () => {
    const urls = [
      'https://www.google.com',
      'https://www.github.com',
      'https://www.wikipedia.org',
    ];

    for (const original of urls) {
      const { body } = await request(app)
        .post('/api/shorten')
        .send({ url: original });

      const res = await request(app).get(body.shortUrl);

      expect(res.status).toBe(302);
      expect(res.headers['location']).toBe(original);
    }
  });

  test('returns 404 when the short code does not exist', async () => {
    const res = await request(app).get('/s/nonexistent');
    expect(res.status).toBe(404);
  });
});

// ─── GET /api/urls ────────────────────────────────────────────────────────────

describe('GET /api/urls', () => {
  test('returns an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('lists all shortened URLs with shortCode, shortUrl, and originalUrl fields', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://example.com' });
    await request(app).post('/api/shorten').send({ url: 'https://another.com' });

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

// ─── DELETE /api/urls/:code ───────────────────────────────────────────────────

describe('DELETE /api/urls/:code', () => {
  test('deletes a short URL and the redirect no longer works', async () => {
    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://delete-me.com' });

    // Confirm it redirects before deletion
    const before = await request(app).get(body.shortUrl);
    expect(before.status).toBe(302);

    // Delete it
    const del = await request(app).delete(`/api/urls/${body.shortCode}`);
    expect(del.status).toBe(200);

    // Now the redirect must return 404
    const after = await request(app).get(body.shortUrl);
    expect(after.status).toBe(404);
  });

  test('returns 404 when deleting a non-existent code', async () => {
    const res = await request(app).delete('/api/urls/doesnotexist');
    expect(res.status).toBe(404);
  });
});
