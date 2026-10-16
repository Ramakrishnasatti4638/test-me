const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'todos.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Routes

// GET /api/todos - Fetch all todos
app.get('/api/todos', (req, res) => {
  db.all('SELECT * FROM todos ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST /api/todos - Create a new todo
app.post('/api/todos', (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  db.run(
    'INSERT INTO todos (title) VALUES (?)',
    [title],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, title, completed: 0, createdAt: new Date() });
    }
  );
});

// PATCH /api/todos/:id - Update todo (mark complete)
app.patch('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed, title } = req.body;

  let query = 'UPDATE todos SET ';
  const updates = [];
  const params = [];

  if (completed !== undefined) {
    updates.push('completed = ?');
    params.push(completed ? 1 : 0);
  }

  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
    res.json({ success: true });
  });
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
    res.json({ success: true });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
