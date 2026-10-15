const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// In-memory todo store
let todos = [
  { id: 1, text: 'Learn Node.js', completed: false },
  { id: 2, text: 'Build a todo app', completed: false }
];

let nextId = 3;

// GET all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// POST create a new todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Text is required and must be a non-empty string' });
  }
  const todo = { id: nextId++, text: text.trim(), completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});

// PUT update a todo
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  if (req.body.text !== undefined) {
    const text = req.body.text;
    if (typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Text must be a non-empty string' });
    }
    todo.text = text.trim();
  }
  if (req.body.completed !== undefined) {
    todo.completed = Boolean(req.body.completed);
  }
  res.json(todo);
});

// DELETE a todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  const deleted = todos.splice(index, 1);
  res.json(deleted[0]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
