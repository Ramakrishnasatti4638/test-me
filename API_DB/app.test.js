const request = require('supertest');
const app = require('./app');
const store = require('./store');

beforeEach(() => {
  store.clear();
});

// ── POST /api/shorten ─────────────────────────────────────────────────────────

describe('POST /api/shorten', () => {
  test('returns 201 and entry for valid URL', async () => {
    const res = await request(app).post('/api/shorten').send({ url: 'https://example.com' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      originalUrl: 'https://example.com',
      clickCount: 0,
    });
    expect(res.body.shortCode).toHaveLength(6);
    expect(res.body.createdAt).toBeDefined();
  });

  test('short code is alphanumeric', async () => {
    const res = await request(app).post('/api/shorten').send({ url: 'https://example.com' });
    expect(res.body.shortCode).toMatch(/^[a-zA-Z0-9]{6}$/);
  });

  test('returns 400 for missing URL', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('returns 400 for invalid URL (no protocol)', async () => {
    const res = await request(app).post('/api/shorten').send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
  });

  test('returns 400 for invalid URL (ftp protocol)', async () => {
    const res = await request(app).post('/api/shorten').send({ url: 'ftp://example.com' });
    expect(res.status).toBe(400);
  });

  test('accepts custom alias', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'mylink' });
    expect(res.status).toBe(201);
    expect(res.body.shortCode).toBe('mylink');
  });

  test('returns 409 if custom alias already taken', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://example.com', customAlias: 'taken' });
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://other.com', customAlias: 'taken' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/taken/i);
  });

  test('returns 400 for invalid custom alias characters', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'bad alias!' });
    expect(res.status).toBe(400);
  });
});

// ── GET /:shortCode ───────────────────────────────────────────────────────────

describe('GET /:shortCode', () => {
  test('redirects 302 to original URL', async () => {
    const createRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'redir1' });
    const { shortCode } = createRes.body;

    const res = await request(app).get(`/${shortCode}`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://example.com');
  });

  test('increments clickCount on redirect', async () => {
    await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com', customAlias: 'click1' });

    await request(app).get('/click1');
    await request(app).get('/click1');

    const linksRes = await request(app).get('/api/links');
    const link = linksRes.body.find((l) => l.shortCode === 'click1');
    expect(link.clickCount).toBe(2);
  });

  test('returns 404 for unknown short code', async () => {
    const res = await request(app).get('/xxxxxx');
    expect(res.status).toBe(404);
  });
});

// ── GET /api/links ────────────────────────────────────────────────────────────

describe('GET /api/links', () => {
  test('returns empty array when no links exist', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all created links', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://alpha.com', customAlias: 'alpha' });
    await request(app).post('/api/shorten').send({ url: 'https://beta.com', customAlias: 'beta' });

    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('sorts by clickCount descending', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://low.com', customAlias: 'low' });
    await request(app).post('/api/shorten').send({ url: 'https://high.com', customAlias: 'high' });

    // click "high" 3 times, "low" once
    await request(app).get('/high');
    await request(app).get('/high');
    await request(app).get('/high');
    await request(app).get('/low');

    const res = await request(app).get('/api/links');
    expect(res.body[0].shortCode).toBe('high');
    expect(res.body[0].clickCount).toBe(3);
    expect(res.body[1].shortCode).toBe('low');
    expect(res.body[1].clickCount).toBe(1);
  });
});

// ── DELETE /api/links/:shortCode ──────────────────────────────────────────────

describe('DELETE /api/links/:shortCode', () => {
  test('deletes an existing link and returns 200', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://example.com', customAlias: 'del1' });

    const res = await request(app).delete('/api/links/del1');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    const linksRes = await request(app).get('/api/links');
    expect(linksRes.body.find((l) => l.shortCode === 'del1')).toBeUndefined();
  });

  test('returns 404 when deleting non-existent code', async () => {
    const res = await request(app).delete('/api/links/noexist');
    expect(res.status).toBe(404);
  });

  test('redirect returns 404 after deletion', async () => {
    await request(app).post('/api/shorten').send({ url: 'https://example.com', customAlias: 'gone' });
    await request(app).delete('/api/links/gone');

    const res = await request(app).get('/gone');
    expect(res.status).toBe(404);
  });
});
