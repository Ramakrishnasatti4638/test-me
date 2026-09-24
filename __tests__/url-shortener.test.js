const request = require('supertest');
const { app, db, server } = require('../server');

describe('URL Shortener API', () => {
  afterAll((done) => {
    db.close();
    server.close(done);
  });

  describe('POST /api/shorten', () => {
    test('should create a short URL for valid input', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('shortCode');
      expect(res.body).toHaveProperty('shortUrl');
      expect(res.body.originalUrl).toBe('https://www.example.com');
      expect(res.body.shortUrl).toMatch(/http:\/\/localhost:\d+\/[a-z0-9]+/i);
    });

    test('should reject empty URL', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: '' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('should reject invalid URL format', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-valid-url' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid URL format');
    });

    test('should reject missing URL property', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });
  });

  describe('GET /api/urls/:shortCode', () => {
    let createdShortCode;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.google.com' });
      createdShortCode = res.body.shortCode;
    });

    test('should retrieve URL data by short code', async () => {
      const res = await request(app)
        .get(`/api/urls/${createdShortCode}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('originalUrl');
      expect(res.body.originalUrl).toBe('https://www.google.com');
    });

    test('should return 404 for non-existent short code', async () => {
      const res = await request(app)
        .get('/api/urls/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /:shortCode - Redirect Test (KEY TEST: Click Link → Redirect)', () => {
    let shortCode;
    const testUrl = 'https://www.github.com';

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: testUrl });
      shortCode = res.body.shortCode;
    });

    test('KEY TEST: When user clicks short link, it should redirect to original URL', async () => {
      const res = await request(app)
        .get(`/${shortCode}`)
        .redirects(0); // Don't follow redirects, we want to check the redirect response

      // Should return 301 (Moved Permanently) status - this is a redirect
      expect(res.status).toBe(301);
      
      // The Location header should point to the original URL
      // This proves the redirect is working correctly
      expect(res.headers.location).toBe(testUrl);
    });

    test('should return 404 for invalid short code (link does not exist)', async () => {
      const res = await request(app)
        .get('/invalidcode')
        .redirects(0);

      expect(res.status).toBe(404);
    });

    test('should properly handle short codes with special characters', async () => {
      const specialUrl = 'https://example.com/path?id=123&name=test#section';
      const createRes = await request(app)
        .post('/api/shorten')
        .send({ url: specialUrl });

      const code = createRes.body.shortCode;

      const redirectRes = await request(app)
        .get(`/${code}`)
        .redirects(0);

      expect(redirectRes.status).toBe(301);
      expect(redirectRes.headers.location).toBe(specialUrl);
    });
  });

  describe('Integration - Full Flow', () => {
    test('should complete full URL shortening and redirect flow', async () => {
      const longUrl = 'https://www.example.com/very/long/url/path?query=1&other=2';

      // Step 1: Create short URL
      const shortenRes = await request(app)
        .post('/api/shorten')
        .send({ url: longUrl });

      expect(shortenRes.status).toBe(200);
      const { shortCode } = shortenRes.body;
      expect(shortCode).toBeDefined();

      // Step 2: Verify we can retrieve the URL data
      const getRes = await request(app)
        .get(`/api/urls/${shortCode}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.originalUrl).toBe(longUrl);

      // Step 3: Verify redirect works (KEY TEST - this is what happens when user clicks)
      const redirectRes = await request(app)
        .get(`/${shortCode}`)
        .redirects(0);

      expect(redirectRes.status).toBe(301);
      expect(redirectRes.headers.location).toBe(longUrl);
    });

    test('should handle multiple short URLs without collision', async () => {
      const url1 = 'https://www.google.com';
      const url2 = 'https://www.microsoft.com';

      const res1 = await request(app)
        .post('/api/shorten')
        .send({ url: url1 });

      const res2 = await request(app)
        .post('/api/shorten')
        .send({ url: url2 });

      expect(res1.body.shortCode).not.toBe(res2.body.shortCode);

      // Both redirects should work correctly
      const redirect1 = await request(app)
        .get(`/${res1.body.shortCode}`)
        .redirects(0);

      const redirect2 = await request(app)
        .get(`/${res2.body.shortCode}`)
        .redirects(0);

      expect(redirect1.headers.location).toBe(url1);
      expect(redirect2.headers.location).toBe(url2);
    });
  });
});
