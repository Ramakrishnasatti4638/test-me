const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const TODOS_FILE = path.join(__dirname, 'todos.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Load todos from file
function loadTodos() {
  try {
    if (fs.existsSync(TODOS_FILE)) {
      const data = fs.readFileSync(TODOS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading todos:', error);
  }
  return [];
}

// Save todos to file
function saveTodos(todos) {
  try {
    fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
  } catch (error) {
    console.error('Error saving todos:', error);
  }
}

let todos = loadTodos();

// GET all todos
app.get('/api/todos', (req, res) => {
  const filter = req.query.filter || 'all';
  let filtered = todos;
  
  if (filter === 'active') {
    filtered = todos.filter(t => !t.completed);
  } else if (filter === 'completed') {
    filtered = todos.filter(t => t.completed);
  }
  
  res.json(filtered);
});

// GET single todo
app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(todo);
});

// POST create todo
app.post('/api/todos', (req, res) => {
  const { title, description } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTodo = {
    id: Date.now().toString(),
    title: title.trim(),
    description: description || '',
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.push(newTodo);
  saveTodos(todos);
  res.status(201).json(newTodo);
});

// PUT update todo
app.put('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  if (req.body.title !== undefined) {
    if (req.body.title.trim() === '') {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    todo.title = req.body.title.trim();
  }
  
  if (req.body.description !== undefined) {
    todo.description = req.body.description;
  }
  
  if (req.body.completed !== undefined) {
    todo.completed = req.body.completed;
  }
  
  saveTodos(todos);
  res.json(todo);
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const deleted = todos.splice(index, 1);
  saveTodos(todos);
  res.json(deleted[0]);
});

// DELETE all completed todos
app.delete('/api/todos', (req, res) => {
  const initialCount = todos.length;
  todos = todos.filter(t => !t.completed);
  saveTodos(todos);
  
  res.json({
    message: `Deleted ${initialCount - todos.length} completed todos`,
    remaining: todos.length
  });
});

app.listen(PORT, () => {
  console.log(`Todo API server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
