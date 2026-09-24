'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const { UrlStore } = require('../src/store');

describe('URL shortener API', () => {
  let app;

  beforeEach(() => {
    app = createApp(new UrlStore());
  });

  describe('POST /api/shorten', () => {
    it('creates a short link for a valid URL', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/some/long/path' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('code');
      expect(res.body.longUrl).toBe('https://example.com/some/long/path');
      expect(res.body.shortUrl).toContain(`/${res.body.code}`);
      expect(res.body.clicks).toBe(0);
    });

    it('returns the same code for a URL that was already shortened', async () => {
      const first = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });
      const second = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      expect(second.body.code).toBe(first.body.code);
    });

    it('rejects an invalid URL', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-url' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('rejects a missing URL', async () => {
      const res = await request(app).post('/api/shorten').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /:code (clicking a short link)', () => {
    it('redirects to the original URL when the short link is clicked', async () => {
      const longUrl = 'https://example.com/target/page';

      // Create the short link.
      const created = await request(app)
        .post('/api/shorten')
        .send({ url: longUrl });
      const { code } = created.body;

      // Simulate a user clicking the short link.
      const res = await request(app).get(`/${code}`);

      // It should redirect (302) to the original long URL.
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(longUrl);
    });

    it('increments the click count each time the link is clicked', async () => {
      const created = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/counted' });
      const { code } = created.body;

      await request(app).get(`/${code}`);
      await request(app).get(`/${code}`);

      const links = await request(app).get('/api/links');
      const link = links.body.find((l) => l.code === code);
      expect(link.clicks).toBe(2);
    });

    it('returns 404 for an unknown code', async () => {
      const res = await request(app).get('/does-not-exist');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/links', () => {
    it('lists created links, most recent first', async () => {
      await request(app).post('/api/shorten').send({ url: 'https://a.com' });
      await request(app).post('/api/shorten').send({ url: 'https://b.com' });

      const res = await request(app).get('/api/links');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].longUrl).toBe('https://b.com');
    });
  });
});
