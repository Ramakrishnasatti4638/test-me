import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { createApp } from '../src/app.js';
import { initDb } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, 'test.db');

test('URL Shortener Full API & Redirect Suite', async (t) => {
  // Clean up any old test db
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const db = initDb(testDbPath);
  const app = createApp(db);
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(() => {
    server.close();
    db.close();
    if (fs.existsSync(testDbPath)) {
      try { fs.unlinkSync(testDbPath); } catch {}
    }
  });

  await t.test('POST /api/shorten - creates short URL with auto-generated code', async () => {
    const res = await fetch(`${baseUrl}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://example.com/long-page',
        title: 'Example Page'
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.code);
    assert.equal(body.data.original_url, 'https://example.com/long-page');
    assert.equal(body.data.title, 'Example Page');
    assert.ok(body.data.shortUrl.includes(body.data.code));
  });

  await t.test('POST /api/shorten - creates short URL with custom code', async () => {
    const res = await fetch(`${baseUrl}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://github.com',
        title: 'GitHub',
        customCode: 'my-gh'
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.data.code, 'my-gh');
  });

  await t.test('POST /api/shorten - rejects duplicate custom code', async () => {
    const res = await fetch(`${baseUrl}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://another-site.com',
        customCode: 'my-gh'
      })
    });

    assert.equal(res.status, 409);
    const body = await res.json();
    assert.ok(body.error.includes('already taken'));
  });

  await t.test('POST /api/shorten - auto-prepends https:// when missing', async () => {
    const res = await fetch(`${baseUrl}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'wikipedia.org/wiki/Main_Page'
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.data.original_url, 'https://wikipedia.org/wiki/Main_Page');
  });

  await t.test('POST /api/shorten - validates bad URL', async () => {
    const res = await fetch(`${baseUrl}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'not a valid url @@ ##'
      })
    });

    assert.equal(res.status, 400);
  });

  await t.test('GET /api/urls - returns list of urls', async () => {
    const res = await fetch(`${baseUrl}/api/urls`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.urls));
    assert.ok(body.urls.length >= 3);
  });

  await t.test('GET /:code - redirects to original URL and increments clicks', async () => {
    // Perform redirection request (prevent auto-redirect follow to check 302 location)
    const res = await fetch(`${baseUrl}/my-gh`, {
      redirect: 'manual',
      headers: {
        'referer': 'https://google.com',
        'user-agent': 'NodeTestAgent/1.0'
      }
    });

    assert.equal(res.status, 302);
    assert.equal(res.headers.get('location'), 'https://github.com');

    // Check stats
    const statsRes = await fetch(`${baseUrl}/api/stats/my-gh`);
    assert.equal(statsRes.status, 200);
    const stats = await statsRes.json();
    assert.equal(stats.clicks, 1);
    assert.equal(stats.recentClicks.length, 1);
    assert.equal(stats.recentClicks[0].referer, 'https://google.com');
  });

  await t.test('GET /api/qr/:code - returns png image', async () => {
    const res = await fetch(`${baseUrl}/api/qr/my-gh`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/png');
    const buffer = await res.arrayBuffer();
    assert.ok(buffer.byteLength > 0);
  });

  await t.test('DELETE /api/urls/:code - deletes URL', async () => {
    const res = await fetch(`${baseUrl}/api/urls/my-gh`, {
      method: 'DELETE'
    });
    assert.equal(res.status, 200);

    const getRes = await fetch(`${baseUrl}/api/stats/my-gh`);
    assert.equal(getRes.status, 404);
  });

  await t.test('GET /:code - returns 404 for non-existent code', async () => {
    const res = await fetch(`${baseUrl}/non-existent-code-12345`);
    assert.equal(res.status, 404);
  });
});
