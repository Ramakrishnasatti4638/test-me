import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, urlMap } from './server.js';

describe('URL Shortener - Integration Tests', () => {
  beforeEach(() => {
    urlMap.clear();
  });

  describe('End-to-End: Create Short URL and Follow Redirect', () => {
    it('should allow user to create a short URL and then redirect when clicking the link', async () => {
      const originalUrl = 'https://www.wikipedia.org/wiki/URL_shortening';

      // Step 1: User creates a short URL
      const createRes = await request(app)
        .post('/api/shorten')
        .send({ longUrl: originalUrl })
        .expect(200);

      const { shortId, shortUrl } = createRes.body;

      expect(shortId).toBeDefined();
      expect(shortUrl).toContain(shortId);

      // Step 2: Verify the URL mapping is stored
      expect(urlMap.has(shortId)).toBe(true);
      expect(urlMap.get(shortId)).toBe(originalUrl);

      // Step 3: User clicks the short link and gets redirected
      const redirectRes = await request(app)
        .get(`/${shortId}`)
        .expect(302); // HTTP 302 Found (redirect)

      expect(redirectRes.headers.location).toBe(originalUrl);
      console.log(`✓ User created short URL: ${shortUrl}`);
      console.log(`✓ User clicked link and was redirected to: ${originalUrl}`);
    });

    it('should handle multiple users creating and accessing different short URLs', async () => {
      const urlMappings = [
        { longUrl: 'https://www.amazon.com', userId: 'user1' },
        { longUrl: 'https://www.netflix.com', userId: 'user2' },
        { longUrl: 'https://www.linkedin.com', userId: 'user3' }
      ];

      const results = [];

      // Each user creates their own short URL
      for (const mapping of urlMappings) {
        const createRes = await request(app)
          .post('/api/shorten')
          .send({ longUrl: mapping.longUrl })
          .expect(200);

        results.push({
          userId: mapping.userId,
          shortId: createRes.body.shortId,
          longUrl: mapping.longUrl
        });
      }

      // Each user clicks their short link
      for (const result of results) {
        const redirectRes = await request(app)
          .get(`/${result.shortId}`)
          .expect(302);

        expect(redirectRes.headers.location).toBe(result.longUrl);
        console.log(`✓ ${result.userId} clicked their link and was redirected correctly`);
      }
    });

    it('should handle URLs with special characters and query parameters', async () => {
      const complexUrl = 'https://www.example.com/search?q=url%20shortener&sort=date&filter=recent';

      const createRes = await request(app)
        .post('/api/shorten')
        .send({ longUrl: complexUrl })
        .expect(200);

      const { shortId } = createRes.body;

      const redirectRes = await request(app)
        .get(`/${shortId}`)
        .expect(302);

      expect(redirectRes.headers.location).toBe(complexUrl);
      console.log(`✓ Complex URL with query parameters handled correctly`);
    });

    it('should handle very long URLs correctly', async () => {
      const veryLongUrl = 'https://www.example.com/' + 'a'.repeat(500);

      const createRes = await request(app)
        .post('/api/shorten')
        .send({ longUrl: veryLongUrl })
        .expect(200);

      const { shortId } = createRes.body;

      const redirectRes = await request(app)
        .get(`/${shortId}`)
        .expect(302);

      expect(redirectRes.headers.location).toBe(veryLongUrl);
      console.log(`✓ Very long URL (${veryLongUrl.length} chars) handled correctly`);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should reject URLs with invalid formats gracefully', async () => {
      const invalidUrls = [
        'not a url',
        'htp://wrong-protocol.com',
        'javascript:alert("xss")'
      ];

      for (const invalidUrl of invalidUrls) {
        const response = await request(app)
          .post('/api/shorten')
          .send({ longUrl: invalidUrl });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      }

      // Test empty string separately (missing longUrl)
      const emptyResponse = await request(app)
        .post('/api/shorten')
        .send({ longUrl: '' });

      expect(emptyResponse.status).toBe(400);
      expect(emptyResponse.body.error).toBeDefined();

      console.log(`✓ All invalid URLs were rejected`);
    });

    it('should handle rapid successive short URL creations', async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/shorten')
            .send({ longUrl: `https://example.com/page${i}` })
        );
      }

      const responses = await Promise.all(promises);
      const shortIds = new Set(responses.map(r => r.body.shortId));

      // All short IDs should be unique
      expect(shortIds.size).toBe(10);
      console.log(`✓ Created 10 short URLs rapidly - all unique`);
    });

    it('should store and retrieve all URLs correctly', async () => {
      const testUrls = [
        'https://www.youtube.com',
        'https://www.twitter.com',
        'https://www.instagram.com',
        'https://www.tiktok.com'
      ];

      for (const url of testUrls) {
        await request(app)
          .post('/api/shorten')
          .send({ longUrl: url });
      }

      const response = await request(app)
        .get('/api/urls')
        .expect(200);

      expect(response.body.length).toBe(testUrls.length);
      const retrievedUrls = response.body.map(item => item.longUrl);
      
      for (const url of testUrls) {
        expect(retrievedUrls).toContain(url);
      }
      console.log(`✓ All ${testUrls.length} URLs stored and retrieved correctly`);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle sharing a short URL multiple times', async () => {
      const originalUrl = 'https://www.example.com/article/trending-news';

      const createRes = await request(app)
        .post('/api/shorten')
        .send({ longUrl: originalUrl })
        .expect(200);

      const { shortId } = createRes.body;

      // Simulate 5 different users clicking the same short link
      for (let i = 0; i < 5; i++) {
        const redirectRes = await request(app)
          .get(`/${shortId}`)
          .expect(302);

        expect(redirectRes.headers.location).toBe(originalUrl);
      }
      console.log(`✓ Short URL accessed 5 times - all redirects successful`);
    });

    it('should support URLs from different domains', async () => {
      const domains = [
        'https://google.com',
        'https://github.com',
        'https://stackoverflow.com',
        'https://linkedin.com',
        'https://reddit.com'
      ];

      const shortIds = [];
      for (const url of domains) {
        const response = await request(app)
          .post('/api/shorten')
          .send({ longUrl: url });

        shortIds.push(response.body.shortId);
      }

      // Verify all different domains redirect correctly
      for (let i = 0; i < domains.length; i++) {
        const redirectRes = await request(app)
          .get(`/${shortIds[i]}`)
          .expect(302);

        expect(redirectRes.headers.location).toBe(domains[i]);
      }
      console.log(`✓ URLs from ${domains.length} different domains handled correctly`);
    });
  });
});
