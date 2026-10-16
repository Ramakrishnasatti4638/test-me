# Todo App

A modern, full-stack todo application built with React, Express, and SQLite.

## Features

✅ **Create, Read, Update, Delete (CRUD)** - Full todo management  
✅ **Persistent Storage** - SQLite database  
✅ **Real-time UI Updates** - React state management  
✅ **Beautiful UI** - Modern gradient design with smooth animations  
✅ **Edit Todos** - Inline editing with description support  
✅ **Mark Complete** - Track progress with completed/active sections  
✅ **Responsive Design** - Works on all screen sizes  
✅ **Error Handling** - User-friendly error messages  

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tool and dev server
- **CSS3** - Modern styling with animations

### Backend
- **Express.js** - REST API server
- **SQLite3** - Lightweight database
- **CORS** - Cross-origin request handling

## Project Structure

```
├── server/
│   └── index.js                 # Express API server
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # App styles
│   ├── index.css                # Global styles
│   └── components/
│       ├── TodoForm.jsx         # Add todo form
│       ├── TodoForm.css
│       ├── TodoList.jsx         # Todo list container
│       ├── TodoList.css
│       ├── TodoItem.jsx         # Individual todo item
│       └── TodoItem.css
├── index.html                   # HTML template
├── vite.config.js               # Vite configuration
└── package.json                 # Dependencies
```

## API Endpoints

### GET /api/todos
Fetch all todos

### POST /api/todos
Create a new todo
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

### PUT /api/todos/:id
Update a todo
```json
{
  "title": "New title",
  "description": "New description",
  "completed": true
}
```

### DELETE /api/todos/:id
Delete a todo

### GET /api/health
Health check endpoint

## Database Schema

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Development

Install dependencies:
```bash
npm install
```

Start development servers (backend + frontend):
```bash
npm run dev
```

This will start:
- Frontend dev server on port 3000 (with Vite)
- Backend API server on port 5000

The frontend automatically proxies `/api` requests to the backend.

## Building for Production

Build both frontend and backend:
```bash
npm run build
```

## Usage

1. **Add a Todo**: Type in the input field and press Enter or click "Add Todo"
2. **Mark Complete**: Click the checkbox next to a todo
3. **Edit**: Click on a todo to edit its title or description
4. **Delete**: Click the ✕ button to remove a todo
5. **View Progress**: See completion status in the header

## Styling

The app features:
- Gradient purple theme (667eea → 764ba2)
- Smooth animations and transitions
- Responsive design for mobile and desktop
- Hover effects and visual feedback
- Clean, modern interface

## Error Handling

- Network errors are displayed in a user-friendly banner
- Database errors are logged to console
- Form validation prevents empty todos
- All API errors are caught and handled gracefully
