import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, '..', 'todos.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Todos table ready');
    }
  });
}

// Helper to promisify database operations
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Routes

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await dbAll('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single todo
app.get('/api/todos/:id', async (req, res) => {
  try {
    const todo = await dbGet('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await dbRun(
      'INSERT INTO todos (title, description) VALUES (?, ?)',
      [title, description || '']
    );
    
    const todo = await dbGet('SELECT * FROM todos WHERE id = ?', [result.lastID]);
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const todo = await dbGet('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    await dbRun(
      'UPDATE todos SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title !== undefined ? title : todo.title, description !== undefined ? description : todo.description, completed !== undefined ? completed : todo.completed, req.params.id]
    );
    
    const updated = await dbGet('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todo = await dbGet('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    await dbRun('DELETE FROM todos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
