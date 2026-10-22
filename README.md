# Todo App

A modern, full-stack todo application built with React, TypeScript, Express, and Tailwind CSS.

## Features

- ✅ Create, read, update, and delete todos
- 🎨 Beautiful, responsive UI with Tailwind CSS
- 🔄 Real-time state management
- 📊 Task statistics (total and completed count)
- 🎯 Active and completed task sections
- ⚡ Fast development with Vite and hot module reloading

## Architecture

### Backend (Express.js)
- RESTful API on port 3001
- In-memory data storage (can be extended to use SQLite/PostgreSQL)
- CORS enabled for frontend communication
- Full CRUD operations for todos

### Frontend (React + TypeScript)
- Vite for fast development and building
- React Hooks for state management
- Tailwind CSS for styling
- TypeScript for type safety
- Responsive design for all screen sizes

## Project Structure

```
├── server/
│   └── index.js           # Express server
├── src/
│   ├── components/
│   │   ├── TodoInput.tsx  # Input form for new todos
│   │   ├── TodoItem.tsx   # Individual todo item
│   │   └── TodoList.tsx   # List container
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Installation & Setup

```bash
# Install dependencies
npm install

# Run development mode (both server and client)
npm run dev

# Run server only
npm run dev:server

# Run client only
npm run dev:client

# Build for production
npm build

# Preview production build
npm preview
```

## API Endpoints

### GET /api/todos
Retrieve all todos

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Task title",
    "completed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/todos
Create a new todo

**Request:**
```json
{
  "title": "New task"
}
```

**Response:** Created todo object (201)

### PATCH /api/todos/:id
Update a todo (title and/or completed status)

**Request:**
```json
{
  "title": "Updated title",
  "completed": true
}
```

**Response:** Updated todo object

### DELETE /api/todos/:id
Delete a todo

**Response:** Deleted todo object

## Technologies Used

- **Frontend:**
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Fetch API

- **Backend:**
  - Express.js
  - Node.js
  - UUID for ID generation
  - CORS middleware

## Development Notes

- The backend runs on `http://localhost:3001`
- The frontend runs on `http://localhost:3000`
- CORS is configured to allow frontend-backend communication
- The app uses in-memory storage (data is lost on server restart)

## Future Enhancements

- Persistent database (SQLite/PostgreSQL)
- User authentication
- Task categories and tags
- Due dates and reminders
- Dark mode toggle
- Drag-and-drop reordering
- Export/import functionality
