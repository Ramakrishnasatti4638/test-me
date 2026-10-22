import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Utility functions
const dbRun = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Routes

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await dbAll('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const id = uuidv4();
    await dbRun(
      'INSERT INTO todos (id, title, description) VALUES (?, ?, ?)',
      [id, title, description || '']
    );
    
    const todo = await dbGet('SELECT * FROM todos WHERE id = ?', [id]);
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    
    const updates = [];
    const params = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      params.push(completed ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return res.json(todo);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);
    
    const sql = `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`;
    await dbRun(sql, params);
    
    const updated = await dbGet('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.json({ message: 'Todo deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear completed todos
app.delete('/api/todos', async (req, res) => {
  try {
    await dbRun('DELETE FROM todos WHERE completed = 1');
    res.json({ message: 'Completed todos cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Todo API running on http://localhost:${PORT}`);
});
