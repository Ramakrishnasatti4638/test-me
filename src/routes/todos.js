import { Router } from 'express';
import { todos, users, getNextTodoId } from '../data/store.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(todos);
});

router.post('/', (req, res) => {
  const body = req.body ?? {};
  const { title, userId, completed } = body;

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'userId is required and must be a positive integer' });
  }
  if (!users.some((u) => u.id === userId)) {
    return res.status(400).json({ error: 'userId must reference an existing user' });
  }

  const todo = {
    id: getNextTodoId(),
    title: title.trim(),
    completed: typeof completed === 'boolean' ? completed : false,
    userId,
  };
  todos.push(todo);
  res.status(201).json(todo);
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const body = req.body ?? {};
  const { title, completed, userId } = body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    todo.title = title.trim();
  }
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }
    todo.completed = completed;
  }
  if (userId !== undefined) {
    if (!Number.isInteger(userId) || userId <= 0 || !users.some((u) => u.id === userId)) {
      return res.status(400).json({ error: 'userId must reference an existing user' });
    }
    todo.userId = userId;
  }

  res.json(todo);
});

export default router;