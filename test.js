'use strict';

/**
 * Self-contained test runner. We boot the Express app on a random port,
 * hit it over HTTP, and verify the shortener behaviour end-to-end.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

// Make sure each test run gets a clean DB so we have predictable counts.
const dataDir = path.join(__dirname, 'data');
if (fs.existsSync(dataDir)) {
  for (const f of fs.readdirSync(dataDir)) {
    fs.unlinkSync(path.join(dataDir, f));
  }
} else {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = require('./server');

function listen(app) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

function request(server, method, urlPath, body, redirect = 'manual') {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: urlPath,
        method,
        headers: data
          ? {
              'Content-Type': 'application/json',
              'Content-Length': data.length,
            }
          : {},
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: text,
            json: text ? safeJSON(text) : null,
          });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function safeJSON(text) {
  try { return JSON.parse(text); } catch (_) { return null; }
}

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

function assert(cond, msg) {
  if (!cond) throw new Error('Assertion failed: ' + msg);
}

let server;

(async () => {
  let pass = 0;
  let fail = 0;
  server = await listen(app);

  for (const t of tests) {
    try {
      await t.fn();
      console.log(`  ✓  ${t.name}`);
      pass++;
    } catch (err) {
      console.log(`  ✗  ${t.name}`);
      console.log(`     ${err.message}`);
      fail++;
    }
  }

  await new Promise((r) => server.close(r));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})();

// =====================
// Tests
// =====================

test('POST /api/shorten with a valid URL creates a short link', async () => {
  const res = await request(server, 'POST', '/api/shorten', {
    url: 'https://example.com/some/very/long/path?with=query',
  });
  assert(res.status === 201, `expected 201, got ${res.status}`);
  assert(typeof res.json.code === 'string' && res.json.code.length > 0, 'code should be set');
  assert(res.json.url === 'https://example.com/some/very/long/path?with=query', 'url round-trips');
  assert(res.json.clicks === 0, 'clicks start at 0');
});

test('POST /api/shorten rejects invalid URLs', async () => {
  for (const bad of ['not-a-url', 'ftp://example.com', '', 'javascript:alert(1)']) {
    const res = await request(server, 'POST', '/api/shorten', { url: bad });
    assert(res.status === 400, `expected 400 for "${bad}", got ${res.status}`);
  }
});

test('POST /api/shorten accepts a custom alias', async () => {
  const res = await request(server, 'POST', '/api/shorten', {
    url: 'https://example.com/custom',
    code: 'my-link_123',
  });
  assert(res.status === 201, `expected 201, got ${res.status}`);
  assert(res.json.code === 'my-link_123', `expected custom code, got ${res.json.code}`);
});

test('POST /api/shorten rejects an invalid custom alias', async () => {
  const res = await request(server, 'POST', '/api/shorten', {
    url: 'https://example.com',
    code: 'has spaces and !',
  });
  assert(res.status === 400, `expected 400, got ${res.status}`);
});

test('POST /api/shorten rejects a duplicate custom alias', async () => {
  await request(server, 'POST', '/api/shorten', {
    url: 'https://example.com/first',
    code: 'dup',
  });
  const res = await request(server, 'POST', '/api/shorten', {
    url: 'https://example.com/second',
    code: 'dup',
  });
  assert(res.status === 409, `expected 409, got ${res.status}`);
});

test('GET /:code 301-redirects to the original URL and counts clicks', async () => {
  const created = await request(server, 'POST', '/api/shorten', {
    url: 'https://example.com/redirect-target',
  });
  assert(created.status === 201, 'create should succeed');

  const r1 = await request(server, 'GET', `/${created.json.code}`);
  assert(r1.status === 301, `expected 301, got ${r1.status}`);
  assert(r1.headers.location === 'https://example.com/redirect-target', 'redirect target');

  const r2 = await request(server, 'GET', `/${created.json.code}`);
  assert(r2.status === 301, 'second redirect still works');

  const detail = await request(server, 'GET', `/api/links/${created.json.code}`);
  assert(detail.json.clicks === 2, `expected 2 clicks, got ${detail.json.clicks}`);
});

test('GET /:code returns 404 for unknown code', async () => {
  const res = await request(server, 'GET', '/this-code-does-not-exist');
  assert(res.status === 404, `expected 404, got ${res.status}`);
});

test('GET /api/links lists all created links', async () => {
  await request(server, 'POST', '/api/shorten', { url: 'https://example.com/list-a' });
  await request(server, 'POST', '/api/shorten', { url: 'https://example.com/list-b' });
  const res = await request(server, 'GET', '/api/links');
  assert(res.status === 200, 'list ok');
  assert(Array.isArray(res.json), 'should be an array');
  assert(res.json.length >= 2, 'should include at least 2 links');
});

test('DELETE /api/links/:code removes a link', async () => {
  const created = await request(server, 'POST', '/api/shorten', {
    url: 'https://example.com/doomed',
  });
  const del = await request(server, 'DELETE', `/api/links/${created.json.code}`);
  assert(del.status === 204, `expected 204, got ${del.status}`);

  const after = await request(server, 'GET', `/${created.json.code}`);
  assert(after.status === 404, 'link should be gone');
});

test('DELETE /api/links/:code is idempotent (404 on second delete)', async () => {
  const created = await request(server, 'POST', '/api/shorten', {
    url: 'https://example.com/twice',
  });
  await request(server, 'DELETE', `/api/links/${created.json.code}`);
  const res = await request(server, 'DELETE', `/api/links/${created.json.code}`);
  assert(res.status === 404, 'second delete returns 404');
});

test('Static frontend is served at /', async () => {
  const res = await request(server, 'GET', '/');
  assert(res.status === 200, 'index served');
  assert(res.body.includes('Shorten'), 'should contain the page heading');
  assert(res.body.includes('id="shorten-form"'), 'should contain the form');
});

test('Two auto-generated codes do not collide', async () => {
  const codes = new Set();
  for (let i = 0; i < 25; i++) {
    const res = await request(server, 'POST', '/api/shorten', {
      url: `https://example.com/collision-${i}`,
    });
    assert(res.status === 201, `iteration ${i} create failed: ${res.status}`);
    assert(!codes.has(res.json.code), `collision detected: ${res.json.code}`);
    codes.add(res.json.code);
  }
  assert(codes.size === 25, 'all 25 codes should be unique');
});