# Todo App

A modern, full-stack todo application with a clean UI and RESTful API.

## Features

- ✅ Create, read, update, and delete todos
- ✅ Mark todos as complete/incomplete
- ✅ View todo statistics (total, completed, pending)
- ✅ Clean, responsive UI with modern design
- ✅ RESTful API backend
- ✅ Real-time UI updates

## Project Structure

```
todo-app/
├── server/
│   └── index.js          # Express server with API endpoints
├── public/
│   └── index.html        # Frontend HTML, CSS, and JavaScript
├── package.json          # Project dependencies
└── README.md             # This file
```

## API Endpoints

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Todo Object Structure

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "",
  "completed": false,
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

## Technologies

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **CORS**: Enabled for cross-origin requests

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and visit http://localhost:3000

## Features Walkthrough

### Adding a Todo
- Type your task in the input field
- Press Enter or click the "Add" button
- Your todo appears in the list

### Completing a Todo
- Click the checkbox next to a todo to mark it complete
- Completed todos appear with strikethrough text and reduced opacity

### Deleting a Todo
- Click the "Delete" button on any todo
- A confirmation dialog will appear

### Viewing Statistics
- The stats panel at the bottom shows:
  - Total: Total number of todos
  - Completed: Number of completed todos
  - Pending: Number of incomplete todos

## License

MIT
