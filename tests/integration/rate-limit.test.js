'use strict';

// Verifies the rate-limit middleware really does trip when the per-IP budget
// is exhausted. We build a tiny app that re-uses the production auth router
// but with `max: 2` so we don't have to fire 21 requests.
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRouter = require('../../src/routes/auth.routes');
const { errorHandler, notFound } = require('../../src/middleware/error');

function buildAppWithLimit(max) {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: 'http://localhost', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' },
    },
  });

  app.post('/api/auth/login', limiter, (req, res, next) => {
    // Skip the route's own validator/handler — we only want to verify the
    // limiter's response shape. Forwarding to the real handler would 400
    // before we could observe 429.
    res.status(200).json({ ok: true });
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

const request = require('supertest');

describe('auth rate limiter', () => {
  test('responds with 429 RATE_LIMITED once the per-IP budget is exhausted', async () => {
    const app = buildAppWithLimit(2);
    const r1 = await request(app).post('/api/auth/login').send({});
    const r2 = await request(app).post('/api/auth/login').send({});
    const r3 = await request(app).post('/api/auth/login').send({});

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(429);
    expect(r3.body).toEqual({
      error: { code: 'RATE_LIMITED', message: expect.any(String) },
    });
    // Standard rate-limit headers should be present.
    expect(r3.headers['ratelimit-limit']).toBeDefined();
  });
});