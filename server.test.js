const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
  let shortCode;

  describe('POST /api/shorten', () => {
    test('should create a shortened URL', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.example.com/very/long/url/path' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('shortCode');
      expect(res.body).toHaveProperty('shortUrl');
      expect(res.body).toHaveProperty('originalUrl');
      expect(res.body.originalUrl).toBe('https://www.example.com/very/long/url/path');
      shortCode = res.body.shortCode;
    });

    test('should return 400 if URL is missing', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('should return unique short codes', async () => {
      const res1 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example1.com' });

      const res2 = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example2.com' });

      expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
    });
  });

  describe('GET /s/:code - Redirect', () => {
    test('should redirect to original URL when clicking short link', async () => {
      // First, create a shortened URL
      const createRes = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://www.google.com' });

      const code = createRes.body.shortCode;

      // Now test the redirect
      const redirectRes = await request(app)
        .get(`/s/${code}`)
        .redirects(0);

      expect(redirectRes.statusCode).toBe(302);
      expect(redirectRes.header.location).toBe('https://www.google.com');
    });

    test('should redirect URL without protocol', async () => {
      const createRes = await request(app)
        .post('/api/shorten')
        .send({ url: 'example.com' });

      const code = createRes.body.shortCode;

      const redirectRes = await request(app)
        .get(`/s/${code}`)
        .redirects(0);

      expect(redirectRes.statusCode).toBe(302);
      expect(redirectRes.header.location).toBe('https://example.com');
    });

    test('should return 404 for non-existent short code', async () => {
      const res = await request(app)
        .get('/s/NONEXISTENT');

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe('Short URL not found');
    });
  });

  describe('GET /api/urls', () => {
    test('should retrieve all shortened URLs', async () => {
      // Create a couple of URLs
      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://test1.com' });

      await request(app)
        .post('/api/shorten')
        .send({ url: 'https://test2.com' });

      const res = await request(app)
        .get('/api/urls');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('shortCode');
      expect(res.body[0]).toHaveProperty('originalUrl');
      expect(res.body[0]).toHaveProperty('shortUrl');
    });
  });
});
