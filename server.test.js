import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, urlMap } from './server.js';

describe('URL Shortener API', () => {
  beforeEach(() => {
    urlMap.clear();
  });

  describe('POST /api/shorten', () => {
    it('should create a short URL for a valid long URL', async () => {
      const longUrl = 'https://www.example.com/very/long/url';

      const response = await request(app)
        .post('/api/shorten')
        .send({ longUrl })
        .expect(200);

      expect(response.body).toHaveProperty('shortId');
      expect(response.body).toHaveProperty('longUrl', longUrl);
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body.shortId).toMatch(/^[a-zA-Z0-9_-]{6}$/);
    });

    it('should reject requests without a long URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid URL formats', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ longUrl: 'not-a-valid-url' })
        .expect(400);

      expect(response.body.error).toBe('Invalid URL format');
    });

    it('should store the mapping in urlMap', async () => {
      const longUrl = 'https://github.com';

      const response = await request(app)
        .post('/api/shorten')
        .send({ longUrl })
        .expect(200);

      const { shortId } = response.body;
      expect(urlMap.has(shortId)).toBe(true);
      expect(urlMap.get(shortId)).toBe(longUrl);
    });
  });

  describe('GET /:shortId (Redirect)', () => {
    it('should redirect to the original URL when short URL is accessed', async () => {
      const longUrl = 'https://www.example.com/article';
      
      // Create short URL
      const createRes = await request(app)
        .post('/api/shorten')
        .send({ longUrl });

      const { shortId } = createRes.body;

      // Access short URL and verify redirect
      const response = await request(app)
        .get(`/${shortId}`)
        .expect(302);

      expect(response.headers.location).toBe(longUrl);
    });

    it('should return 404 for non-existent short URL', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Short URL not found');
    });

    it('should handle multiple short URLs independently', async () => {
      const urls = [
        'https://www.google.com',
        'https://www.github.com',
        'https://www.stackoverflow.com'
      ];

      const shortIds = [];
      for (const longUrl of urls) {
        const res = await request(app)
          .post('/api/shorten')
          .send({ longUrl });
        shortIds.push(res.body.shortId);
      }

      // Verify each short URL redirects correctly
      for (let i = 0; i < shortIds.length; i++) {
        const response = await request(app)
          .get(`/${shortIds[i]}`)
          .expect(302);
        
        expect(response.headers.location).toBe(urls[i]);
      }
    });
  });

  describe('GET /api/urls', () => {
    it('should return all stored URLs', async () => {
      const testUrls = [
        'https://www.example.com',
        'https://www.test.com'
      ];

      // Create short URLs
      for (const longUrl of testUrls) {
        await request(app)
          .post('/api/shorten')
          .send({ longUrl });
      }

      const response = await request(app)
        .get('/api/urls')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('shortId');
      expect(response.body[0]).toHaveProperty('longUrl');
      expect(response.body[0]).toHaveProperty('shortUrl');
    });

    it('should return empty array when no URLs are stored', async () => {
      const response = await request(app)
        .get('/api/urls')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
});
