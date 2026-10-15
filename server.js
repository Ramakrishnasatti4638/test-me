import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory todo storage
let todos = [
  { id: 1, text: 'Welcome to Todo App', completed: false },
  { id: 2, text: 'Click to complete a todo', completed: false }
];
let nextId = 3;

// GET all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// POST a new todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }
  
  const todo = {
    id: nextId++,
    text: text.trim(),
    completed: false
  };
  todos.push(todo);
  res.status(201).json(todo);
});

// PUT update a todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  
  const todo = todos.find(t => t.id === parseInt(id));
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  if (text !== undefined) todo.text = text;
  if (completed !== undefined) todo.completed = completed;
  
  res.json(todo);
});

// DELETE a todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(t => t.id === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const deleted = todos.splice(index, 1);
  res.json(deleted[0]);
});

app.listen(PORT, () => {
  console.log(`Todo app server running on http://localhost:${PORT}`);
});
