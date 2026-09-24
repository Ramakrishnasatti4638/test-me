import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from './server.js';

describe('URL Shortener API', () => {
  let server;
  const validUrl = 'https://www.example.com/very/long/url/that/needs/shortening';
  let createdShortCode;

  beforeAll(() => {
    server = app.listen(3001);
  });

  afterAll(() => {
    server.close();
  });

  describe('POST /api/shorten', () => {
    it('should create a short URL from a long URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ longUrl: validUrl });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('longUrl');
      expect(response.body.longUrl).toBe(validUrl);
      expect(response.body.shortUrl).toMatch(/^http:\/\/localhost:3000\/[a-z0-9]+$/);
      
      // Store shortCode for later tests
      createdShortCode = response.body.shortCode;
    });

    it('should reject request without a long URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should reject invalid URL format', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ longUrl: 'not a valid url' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid URL format');
    });

    it('should generate unique short codes', async () => {
      const response1 = await request(app)
        .post('/api/shorten')
        .send({ longUrl: 'https://example1.com' });

      const response2 = await request(app)
        .post('/api/shorten')
        .send({ longUrl: 'https://example2.com' });

      expect(response1.body.shortCode).not.toBe(response2.body.shortCode);
    });
  });

  describe('GET /api/redirect/:shortCode', () => {
    beforeAll(async () => {
      // Create a short URL first
      const response = await request(app)
        .post('/api/shorten')
        .send({ longUrl: validUrl });
      createdShortCode = response.body.shortCode;
    });

    it('should retrieve the original URL from short code', async () => {
      const response = await request(app)
        .get(`/api/redirect/${createdShortCode}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('longUrl');
      expect(response.body.longUrl).toBe(validUrl);
    });

    it('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .get('/api/redirect/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /:shortCode (Redirect endpoint)', () => {
    let testShortCode;

    beforeAll(async () => {
      // Create a short URL first
      const response = await request(app)
        .post('/api/shorten')
        .send({ longUrl: validUrl });
      testShortCode = response.body.shortCode;
    });

    it('should redirect to the original URL when accessing short code', async () => {
      const response = await request(app)
        .get(`/${testShortCode}`)
        .redirects(0); // Don't follow redirects

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(validUrl);
    });

    it('should successfully redirect with proper headers', async () => {
      const response = await request(app)
        .get(`/${testShortCode}`)
        .redirects(0);

      expect(response.status).toBe(302);
      expect(response.headers['location']).toBe(validUrl);
      expect(response.headers['location']).toMatch(/^https?:\/\//);
    });

    it('should return 404 for non-existent short code', async () => {
      const response = await request(app)
        .get('/nonexistentcode');

      expect(response.status).toBe(404);
    });
  });

  describe('Integration tests', () => {
    it('should complete full workflow: create short URL and redirect to it', async () => {
      const testUrl = 'https://www.github.com/example/repository';

      // Step 1: Create a short URL
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ longUrl: testUrl });

      expect(createResponse.status).toBe(200);
      const { shortCode, shortUrl } = createResponse.body;

      // Step 2: Get the original URL from short code
      const getResponse = await request(app)
        .get(`/api/redirect/${shortCode}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.longUrl).toBe(testUrl);

      // Step 3: Test the redirect endpoint
      const redirectResponse = await request(app)
        .get(`/${shortCode}`)
        .redirects(0);

      expect(redirectResponse.status).toBe(302);
      expect(redirectResponse.headers.location).toBe(testUrl);
    });

    it('should handle multiple URLs without collision', async () => {
      const urls = [
        'https://www.example.com/page1',
        'https://www.example.com/page2',
        'https://www.example.com/page3',
      ];

      const results = await Promise.all(
        urls.map((url) =>
          request(app)
            .post('/api/shorten')
            .send({ longUrl: url })
        )
      );

      // Verify each short URL maps to correct original URL
      for (let i = 0; i < results.length; i++) {
        const shortCode = results[i].body.shortCode;
        const response = await request(app)
          .get(`/api/redirect/${shortCode}`);

        expect(response.body.longUrl).toBe(urls[i]);
      }
    });

    it('should maintain URL integrity through redirect chain', async () => {
      const complexUrl = 'https://www.example.com/search?q=test&page=1&sort=date#results';

      // Create short URL
      const createResponse = await request(app)
        .post('/api/shorten')
        .send({ longUrl: complexUrl });

      const shortCode = createResponse.body.shortCode;

      // Verify redirect goes to exact URL
      const redirectResponse = await request(app)
        .get(`/${shortCode}`)
        .redirects(0);

      expect(redirectResponse.headers.location).toBe(complexUrl);
    });
  });
});
