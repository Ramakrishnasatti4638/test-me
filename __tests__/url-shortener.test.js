const request = require('supertest');
const { app, urlStore } = require('../server');

// Clear the store before each test to avoid cross-test pollution
beforeEach(() => {
  Object.keys(urlStore).forEach(k => delete urlStore[k]);
});

// ─── POST /api/shorten ────────────────────────────────────────────────────────

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

  test('returns 400 for an invalid URL format', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-valid-url' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('generates a unique short code each time', async () => {
    const res1 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    const res2 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.example.com' });

    expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
  });
});

// ─── GET /r/:code  (REDIRECT) ─────────────────────────────────────────────────

describe('GET /r/:code — redirect behaviour', () => {
  test('clicking a short link redirects (302) to the original URL', async () => {
    // Step 1 – create the short link
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://www.openai.com' });

    expect(shortenRes.status).toBe(201);
    const { shortUrl } = shortenRes.body;

    // Step 2 – follow the short link; supertest does NOT auto-follow redirects,
    //          so we assert the redirect response itself.
    const redirectRes = await request(app).get(shortUrl);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.location).toBe('https://www.openai.com');
  });

  test('clicking a short link for a different URL redirects to that URL', async () => {
    const target = 'https://www.github.com/features';

    const { body } = await request(app)
      .post('/api/shorten')
      .send({ url: target });

    const redirectRes = await request(app).get(body.shortUrl);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.location).toBe(target);
  });

  test('returns 404 for an unknown short code', async () => {
    const res = await request(app).get('/r/unknown999');
    expect(res.status).toBe(404);
  });

  test('multiple short links each redirect to their own original URL', async () => {
    const urls = [
      'https://www.google.com',
      'https://www.twitter.com',
      'https://www.wikipedia.org',
    ];

    // Create all short links
    const codes = await Promise.all(
      urls.map(url =>
        request(app).post('/api/shorten').send({ url }).then(r => r.body.shortUrl)
      )
    );

    // Verify each one redirects to the correct target
    for (let i = 0; i < urls.length; i++) {
      const res = await request(app).get(codes[i]);
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(urls[i]);
    }
  });
});

// ─── GET /api/urls ────────────────────────────────────────────────────────────

describe('GET /api/urls', () => {
  test('returns an empty array when no URLs have been shortened', async () => {
    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('lists all shortened URLs with code, shortUrl, and originalUrl', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://www.example.com' });
    await request(app).post('/api/shorten').send({ url: 'https://www.test.com' });

    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    res.body.forEach(item => {
      expect(item).toHaveProperty('code');
      expect(item).toHaveProperty('shortUrl');
      expect(item).toHaveProperty('originalUrl');
    });
  });
});
