const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear the in-memory store before each test so tests are isolated
beforeEach(() => {
  Object.keys(urlStore).forEach(k => delete urlStore[k]);
});

// ─────────────────────────────────────────────
// 1. POST /api/shorten
// ─────────────────────────────────────────────
describe('POST /api/shorten', () => {
  test('shortens a valid URL and returns shortCode + shortUrl', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body.originalUrl).toBe('https://www.example.com');
    expect(res.body.shortCode).toHaveLength(7);
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

  test('generates unique short codes for different URLs', async () => {
    const r1 = await request(app).post('/api/shorten').send({ url: 'https://google.com' });
    const r2 = await request(app).post('/api/shorten').send({ url: 'https://github.com' });

    expect(r1.body.shortCode).not.toBe(r2.body.shortCode);
  });
});

// ─────────────────────────────────────────────
// 2. REDIRECT — clicking the short link redirects
// ─────────────────────────────────────────────
describe('GET /:code — clicking a short link redirects to the original URL', () => {
  test('redirects (302) to the original URL when a valid short code is visited', async () => {
    // Step 1: create a short link
    const createRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.openai.com' });

    const { shortCode } = createRes.body;

    // Step 2: "click" the short link — visit /:code
    const redirectRes = await request(app)
      .get(`/${shortCode}`)
      .redirects(0); // don't follow the redirect; inspect the response itself

    // Assert redirect status and destination
    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.location).toBe('https://www.openai.com');
  });

  test('increments the click counter each time the short link is visited', async () => {
    const { body: { shortCode } } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com/page' });

    // Visit once
    await request(app).get(`/${shortCode}`).redirects(0);
    // Visit twice
    await request(app).get(`/${shortCode}`).redirects(0);

    const infoRes = await request(app).get(`/api/links/${shortCode}`);
    expect(infoRes.body.clicks).toBe(2);
  });

  test('returns 404 for a non-existent short code', async () => {
    const res = await request(app).get('/nonexistent').redirects(0);
    // Server serves index.html for unknown codes — status is 404
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────
// 3. GET /api/links
// ─────────────────────────────────────────────
describe('GET /api/links', () => {
  test('returns an empty array when no links exist', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all shortened links in descending creation order', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://first.com' });
    await request(app).post('/api/shorten').send({ url: 'https://second.com' });

    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    // Most recently created link should appear first
    expect(res.body[0].originalUrl).toBe('https://second.com');
  });
});

// ─────────────────────────────────────────────
// 4. GET /api/links/:code
// ─────────────────────────────────────────────
describe('GET /api/links/:code', () => {
  test('returns metadata for a valid short code', async () => {
    const { body: { shortCode } } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    const res = await request(app).get(`/api/links/${shortCode}`);
    expect(res.status).toBe(200);
    expect(res.body.originalUrl).toBe('https://www.example.com');
    expect(res.body.clicks).toBe(0);
    expect(res.body).toHaveProperty('createdAt');
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/api/links/unknown123');
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────
// 5. DELETE /api/links/:code
// ─────────────────────────────────────────────
describe('DELETE /api/links/:code', () => {
  test('deletes an existing short link', async () => {
    const { body: { shortCode } } = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://delete-me.com' });

    const delRes = await request(app).delete(`/api/links/${shortCode}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.message).toMatch(/deleted/i);

    // Confirm it's gone
    const checkRes = await request(app).get(`/api/links/${shortCode}`);
    expect(checkRes.status).toBe(404);
  });

  test('returns 404 when deleting a non-existent link', async () => {
    const res = await request(app).delete('/api/links/doesnotexist');
    expect(res.status).toBe(404);
  });
});
