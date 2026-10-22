import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory todo storage
let todos = [];
let nextId = 1;

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Get a single todo
app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(todo);
});

// Create a new todo
app.post('/api/todos', (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const todo = {
    id: nextId++,
    title: title.trim(),
    description: description || '',
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(todo);
  res.status(201).json(todo);
});

// Update a todo
app.put('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const { title, description, completed } = req.body;

  if (title !== undefined) {
    todo.title = title.trim();
  }
  if (description !== undefined) {
    todo.description = description;
  }
  if (completed !== undefined) {
    todo.completed = completed;
  }

  res.json(todo);
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const deleted = todos.splice(index, 1);
  res.json(deleted[0]);
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
