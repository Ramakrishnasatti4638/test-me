'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const { UrlStore } = require('../src/store');

describe('URL shortener', () => {
  let app;
  let store;

  beforeEach(() => {
    store = new UrlStore();
    app = createApp({ store });
  });

  describe('POST /api/shorten', () => {
    it('creates a short link for a valid URL', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com/a/very/long/path' });

      expect(res.status).toBe(201);
      expect(res.body.code).toBeTruthy();
      expect(res.body.shortUrl).toContain(`/${res.body.code}`);
    });

    it('rejects an invalid URL', async () => {
      const res = await request(app)
        .post('/api/shorten')
        .send({ url: 'not-a-url' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeTruthy();
    });

    it('reuses the same code for the same URL', async () => {
      const first = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });
      const second = await request(app)
        .post('/api/shorten')
        .send({ url: 'https://example.com' });

      expect(second.body.code).toBe(first.body.code);
    });
  });

  describe('clicking a short link redirects to the original URL', () => {
    it('redirects (302) to the original URL when the short link is opened', async () => {
      const original = 'https://example.com/some/really/long/destination';

      // 1. Create the short link (what the UI does on "Shorten").
      const created = await request(app)
        .post('/api/shorten')
        .send({ url: original });
      expect(created.status).toBe(201);
      const { code } = created.body;

      // 2. Simulate the user clicking the short link -> GET /:code.
      const clicked = await request(app).get(`/${code}`);

      // 3. It must redirect to the original destination.
      expect(clicked.status).toBe(302);
      expect(clicked.headers.location).toBe(original);
    });

    it('returns 404 for an unknown short code', async () => {
      const res = await request(app).get('/does-not-exist');
      expect(res.status).toBe(404);
    });
  });
});
