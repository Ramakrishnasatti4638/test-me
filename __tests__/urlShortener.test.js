const request = require('supertest');
const { app, store } = require('../server');

describe('URL Shortener API', () => {
  // Clear the store before each test for isolation
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  });

  // ─── POST /shorten ────────────────────────────────────────────────────────

  describe('POST /shorten', () => {
    it('should return 201 and a shortUrl when given a valid URL', async () => {
      const res = await request(app)
        .post('/shorten')
        .send({ url: 'https://www.example.com' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('shortCode');
      expect(res.body).toHaveProperty('shortUrl');
      expect(res.body.shortUrl).toMatch(/\/[A-Za-z0-9_-]{7}$/);
    });

    it('should return 400 when no URL is provided', async () => {
      const res = await request(app).post('/shorten').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for an invalid URL format', async () => {
      const res = await request(app)
        .post('/shorten')
        .send({ url: 'not-a-valid-url' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid URL format.');
    });

    it('should generate unique short codes for different URLs', async () => {
      const res1 = await request(app)
        .post('/shorten')
        .send({ url: 'https://www.google.com' });
      const res2 = await request(app)
        .post('/shorten')
        .send({ url: 'https://www.github.com' });

      expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
    });
  });

  // ─── GET /:code (redirect) ────────────────────────────────────────────────

  describe('GET /:code — redirect behaviour', () => {
    it('should redirect (302) to the original URL when the short code is clicked', async () => {
      // Step 1: shorten a URL
      const shortenRes = await request(app)
        .post('/shorten')
        .send({ url: 'https://www.example.com/long/path?query=1' });

      expect(shortenRes.status).toBe(201);
      const { shortCode } = shortenRes.body;

      // Step 2: follow the short link — simulates clicking the link
      const redirectRes = await request(app).get(`/${shortCode}`);

      expect(redirectRes.status).toBe(302);
      expect(redirectRes.headers.location).toBe(
        'https://www.example.com/long/path?query=1'
      );
    });

    it('should redirect to the correct URL for each distinct short code', async () => {
      const url1 = 'https://www.openai.com';
      const url2 = 'https://www.github.com';

      const r1 = await request(app).post('/shorten').send({ url: url1 });
      const r2 = await request(app).post('/shorten').send({ url: url2 });

      const red1 = await request(app).get(`/${r1.body.shortCode}`);
      const red2 = await request(app).get(`/${r2.body.shortCode}`);

      expect(red1.headers.location).toBe(url1);
      expect(red2.headers.location).toBe(url2);
    });

    it('should return 404 for an unknown short code', async () => {
      const res = await request(app).get('/unknownXYZ');
      expect(res.status).toBe(404);
    });
  });

  // ─── GET /stats/:code ─────────────────────────────────────────────────────

  describe('GET /stats/:code', () => {
    it('should return the original URL for a valid short code', async () => {
      const shortenRes = await request(app)
        .post('/shorten')
        .send({ url: 'https://www.nodejs.org' });

      const { shortCode } = shortenRes.body;
      const statsRes = await request(app).get(`/stats/${shortCode}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.originalUrl).toBe('https://www.nodejs.org');
      expect(statsRes.body.shortCode).toBe(shortCode);
    });

    it('should return 404 for stats of an unknown code', async () => {
      const res = await request(app).get('/stats/doesnotexist');
      expect(res.status).toBe(404);
    });
  });
});
