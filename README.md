# Todo App

A modern, full-stack todo application built with Node.js/Express and React.

## Features

- ✅ **Create** new todos with title and optional description
- ✅ **Mark** todos as complete/incomplete
- ✅ **Delete** todos
- ✅ **View** all todos with creation timestamps
- ✅ **Statistics** showing total, completed, and remaining tasks
- ✅ **Responsive Design** - works on desktop, tablet, and mobile
- ✅ **Real-time updates** with instant UI feedback

## Tech Stack

### Backend
- **Node.js** with ES6 modules
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vanilla CSS** - Modern styling with gradients and animations
- **Fetch API** - HTTP client for API communication

## Project Structure

```
├── server.js              # Express server with REST API
├── package.json          # Node.js dependencies and scripts
├── public/
│   ├── index.html        # Main HTML file
│   ├── app.js            # React application (uses React CDN)
│   └── styles.css        # Application styling
└── README.md             # This file
```

## API Endpoints

### GET /api/todos
Get all todos
- **Response**: Array of todo objects

### POST /api/todos
Create a new todo
- **Body**: `{ title: string, description?: string }`
- **Response**: Created todo object with id, createdAt, completed status

### GET /api/todos/:id
Get a specific todo by ID
- **Response**: Todo object or 404 error

### PUT /api/todos/:id
Update a todo
- **Body**: `{ title?: string, description?: string, completed?: boolean }`
- **Response**: Updated todo object

### DELETE /api/todos/:id
Delete a todo
- **Response**: Deleted todo object or 404 error

## Todo Object Structure

```javascript
{
  id: number,              // Unique identifier
  title: string,           // Todo title (required)
  description: string,     // Optional description
  completed: boolean,      // Completion status
  createdAt: string        // ISO timestamp
}
```

## Features in Detail

### Create Todo
- Enter a title in the input field and click "Add" or press Enter
- Description is optional and can be added via the API

### Mark Complete
- Click the checkbox next to any todo to toggle its completion status
- Completed todos appear with strikethrough styling

### Delete Todo
- Click the "Delete" button to remove a todo permanently

### Statistics
- View total todos, completed count, and remaining tasks at a glance
- Updates automatically as you manage your todos

### Error Handling
- User-friendly error messages for failed operations
- Graceful handling of network errors and validation failures

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lightweight: No build process required
- Uses React CDN for zero local dependencies on frontend
- In-memory storage (data resets on server restart)
- Fast API response times with CORS enabled

## Future Enhancements

Potential features for future versions:
- Database persistence (MongoDB, PostgreSQL, SQLite)
- User authentication and multi-user support
- Todo categories and tags
- Due dates and reminders
- Dark mode toggle
- Export/import todos
- Search and filter functionality
