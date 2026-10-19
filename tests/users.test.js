import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Users API', () => {
  describe('GET /users', () => {
    it('returns the seeded users', async () => {
      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('email');
    });
  });

  describe('GET /users/:id', () => {
    it('returns a user by id', async () => {
      const res = await request(app).get('/users/1');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 1, name: 'Alice' });
    });

    it('returns 404 when the user does not exist', async () => {
      const res = await request(app).get('/users/9999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 404 for a non-numeric id', async () => {
      const res = await request(app).get('/users/abc');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /users', () => {
    it('creates a user with valid input', async () => {
      const res = await request(app)
        .post('/users')
        .send({ name: 'Dana', email: 'dana@example.com' });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Dana', email: 'dana@example.com' });
      expect(res.body).toHaveProperty('id');
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/users').send({ email: 'x@y.com' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when name is empty', async () => {
      const res = await request(app)
        .post('/users')
        .send({ name: '   ', email: 'x@y.com' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when email is invalid', async () => {
      const res = await request(app)
        .post('/users')
        .send({ name: 'Eve', email: 'not-an-email' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when body is invalid JSON', async () => {
      const res = await request(app)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send('{ not json');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});