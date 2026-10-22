import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let todos = [];

// Routes

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Create a new todo
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const todo = {
    id: uuidv4(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.push(todo);
  res.status(201).json(todo);
});

// Update a todo
app.patch('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  if (title !== undefined) {
    todo.title = title.trim();
  }
  if (completed !== undefined) {
    todo.completed = completed;
  }
  
  res.json(todo);
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const deleted = todos.splice(index, 1);
  res.json(deleted[0]);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
