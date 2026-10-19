import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Todos API', () => {
  describe('GET /todos', () => {
    it('returns the seeded todos', async () => {
      const res = await request(app).get('/todos');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
      for (const todo of res.body) {
        expect(todo).toHaveProperty('id');
        expect(todo).toHaveProperty('title');
        expect(todo).toHaveProperty('completed');
        expect(todo).toHaveProperty('userId');
      }
    });
  });

  describe('POST /todos', () => {
    it('creates a todo with valid input', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Walk the dog', userId: 1 });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Walk the dog',
        userId: 1,
        completed: false,
      });
      expect(res.body).toHaveProperty('id');
    });

    it('accepts an explicit completed flag', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Done already', userId: 2, completed: true });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ completed: true });
    });

    it('returns 400 when title is missing', async () => {
      const res = await request(app).post('/todos').send({ userId: 1 });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when userId is missing', async () => {
      const res = await request(app).post('/todos').send({ title: 'No user' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when userId references a non-existent user', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Bad user', userId: 9999 });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PATCH /todos/:id', () => {
    it('marks a todo as completed', async () => {
      const res = await request(app).patch('/todos/1').send({ completed: true });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 1, completed: true });
    });

    it('updates the title', async () => {
      const res = await request(app).patch('/todos/2').send({ title: 'Finished reading' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 2, title: 'Finished reading' });
    });

    it('returns 404 when the todo does not exist', async () => {
      const res = await request(app).patch('/todos/9999').send({ completed: true });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when completed is not a boolean', async () => {
      const res = await request(app).patch('/todos/1').send({ completed: 'yes' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});