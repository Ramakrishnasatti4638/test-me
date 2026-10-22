const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const TODOS_FILE = path.join(__dirname, 'todos.json');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Load todos from file
function loadTodos() {
  try {
    if (fs.existsSync(TODOS_FILE)) {
      const data = fs.readFileSync(TODOS_FILE, 'utf8');
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

// Store todos in memory, load from file on startup
let todos = loadTodos();

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Create a new todo
app.post('/api/todos', (req, res) => {
  const { title, description } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTodo = {
    id: Date.now(),
    title: title.trim(),
    description: description || '',
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.push(newTodo);
  saveTodos(todos);
  res.status(201).json(newTodo);
});

// Update a todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  
  const todo = todos.find(t => t.id === parseInt(id));
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  if (title !== undefined) todo.title = title.trim();
  if (description !== undefined) todo.description = description;
  if (completed !== undefined) todo.completed = completed;
  
  saveTodos(todos);
  res.json(todo);
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  
  const index = todos.findIndex(t => t.id === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const deleted = todos.splice(index, 1);
  saveTodos(todos);
  res.json(deleted[0]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
