const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
const initializeDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
};

// Load todos from file
const loadTodos = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Save todos to file
const saveTodos = (todos) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
};

// Routes

// GET all todos
app.get('/api/todos', (req, res) => {
  const todos = loadTodos();
  res.json(todos);
});

// POST a new todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  const todos = loadTodos();
  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.push(newTodo);
  saveTodos(todos);
  res.status(201).json(newTodo);
});

// PUT update a todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  
  const todos = loadTodos();
  const todo = todos.find(t => t.id === parseInt(id));
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  if (text !== undefined) todo.text = text;
  if (completed !== undefined) todo.completed = completed;
  
  saveTodos(todos);
  res.json(todo);
});

// DELETE a todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const todos = loadTodos();
  const index = todos.findIndex(t => t.id === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const [deletedTodo] = todos.splice(index, 1);
  saveTodos(todos);
  res.json(deletedTodo);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize and start server
initializeDataFile();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
