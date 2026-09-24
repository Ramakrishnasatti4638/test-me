const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear store before each test to avoid cross-test pollution
beforeEach(() => {
  Object.keys(urlStore).forEach(k => delete urlStore[k]);
});

// ─── POST /api/shorten ───────────────────────────────────────────────────────

describe('POST /api/shorten', () => {
  test('returns 201 with a shortUrl for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com/some/very/long/path' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortUrl');
    expect(res.body).toHaveProperty('code');
    expect(res.body.shortUrl).toMatch(/\/.{7}$/);
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
    const [r1, r2] = await Promise.all([
      request(app).post('/api/shorten').send({ url: 'https://a.com' }),
      request(app).post('/api/shorten').send({ url: 'https://b.com' }),
    ]);

    expect(r1.body.code).not.toBe(r2.body.code);
  });
});

// ─── GET /:code — Redirect ───────────────────────────────────────────────────

describe('GET /:code — redirect', () => {
  test('clicking/following a short link redirects (302) to the original URL', async () => {
    // Step 1: shorten a URL
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.wikipedia.org/wiki/URL_shortening' });

    expect(shortenRes.status).toBe(201);
    const { code } = shortenRes.body;

    // Step 2: follow the short link — supertest does NOT follow redirects by default,
    //         so we directly verify the 302 + Location header (exactly what a browser does
    //         when you click a link).
    const redirectRes = await request(app).get(`/${code}`);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers['location']).toBe(
      'https://www.wikipedia.org/wiki/URL_shortening'
    );
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/unknown123');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('short link redirects to the exact original URL (no mutation)', async () => {
    const originalUrl = 'https://github.com/expressjs/express?tab=readme';

    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: originalUrl });

    const { headers } = await request(app).get(`/${body.code}`);

    expect(headers['location']).toBe(originalUrl);
  });

  test('multiple short links each redirect to their own original URL', async () => {
    const urls = [
      'https://www.google.com',
      'https://www.github.com',
      'https://www.openai.com',
    ];

    const codes = await Promise.all(
      urls.map(url =>
        request(app)
          .post('/api/shorten')
          .send({ url })
          .then(r => ({ code: r.body.code, url }))
      )
    );

    for (const { code, url } of codes) {
      const res = await request(app).get(`/${code}`);
      expect(res.status).toBe(302);
      expect(res.headers['location']).toBe(url);
    }
  });
});
