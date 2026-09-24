const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear the store before each test to ensure isolation
beforeEach(() => {
  Object.keys(urlStore).forEach(key => delete urlStore[key]);
});

// ─── POST /api/shorten ─────────────────────────────────────────────────────────

describe('POST /api/shorten', () => {
  it('should shorten a valid URL and return 201 with a shortCode', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com/some/long/path' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortCode');
    expect(res.body).toHaveProperty('shortUrl');
    expect(typeof res.body.shortCode).toBe('string');
    expect(res.body.shortCode.length).toBeGreaterThan(0);
  });

  it('should return 400 when no URL is provided', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for an invalid URL format', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-valid-url' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return the same shortCode for a URL that was already shortened', async () => {
    const url = 'https://repeat.example.com';

    const first = await request(app).post('/api/shorten').send({ url });
    const second = await request(app).post('/api/shorten').send({ url });

    expect(first.status).toBe(201);
    expect(second.body.shortCode).toBe(first.body.shortCode);
  });
});

// ─── GET /api/urls ─────────────────────────────────────────────────────────────

describe('GET /api/urls', () => {
  it('should return an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should list all shortened URLs', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://alpha.example.com' });
    await request(app).post('/api/shorten').send({ url: 'https://beta.example.com' });

    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    const originals = res.body.map(item => item.originalUrl);
    expect(originals).toContain('https://alpha.example.com');
    expect(originals).toContain('https://beta.example.com');
  });
});

// ─── GET /:code — redirect ──────────────────────────────────────────────────────

describe('GET /:code (redirect)', () => {
  it('should redirect to the original URL when a valid short code is clicked', async () => {
    const originalUrl = 'https://www.redirect-target.com/page?ref=test';

    // Step 1: shorten the URL
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    expect(shortenRes.status).toBe(201);
    const { shortCode } = shortenRes.body;

    // Step 2: follow the short link — simulate a click
    const redirectRes = await request(app)
      .get(`/${shortCode}`)
      .redirects(0); // capture the redirect response itself

    // Should respond with a 301 redirect
    expect(redirectRes.status).toBe(301);

    // Location header must point to the original URL
    expect(redirectRes.headers.location).toBe(originalUrl);
  });

  it('should return 404 for an unknown short code', async () => {
    const res = await request(app).get('/unknown_code_xyz');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('should follow the redirect and reach the destination URL', async () => {
    const originalUrl = 'https://www.example.com';

    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const { shortCode } = shortenRes.body;

    // supertest can auto-follow redirects; verify the Location header directly
    const res = await request(app)
      .get(`/${shortCode}`)
      .redirects(0);

    expect(res.headers.location).toBe(originalUrl);
    expect([301, 302]).toContain(res.status);
  });
});
