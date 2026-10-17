# Todo App 📝

A modern, full-stack todo application built with React and Express.js featuring a clean UI, real-time updates, and persistent storage.

## Features ✨

- ✅ **Create Todos** - Add new tasks with a single click
- ✅ **Mark Complete** - Check off completed tasks
- ✅ **Edit Todos** - Double-click any todo to edit it
- ✅ **Delete Todos** - Remove tasks you no longer need
- ✅ **Filter View** - View all, active, or completed todos
- ✅ **Persistent Storage** - Todos are saved to SQLite database
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Real-time Updates** - Instant feedback on all actions

## Tech Stack 🛠️

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite3** - Lightweight database
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **React 18** - UI library
- **Axios** - HTTP client
- **CSS3** - Modern styling
- **React Hooks** - State management

## Project Structure

```
todo-app/
├── server/
│   └── index.js                 # Express backend server
├── src/
│   ├── components/
│   │   ├── TodoForm.js         # Input form component
│   │   ├── TodoList.js         # Todo list container
│   │   ├── TodoItem.js         # Individual todo item
│   │   └── TodoFilter.js       # Filter buttons
│   ├── App.js                  # Main app component
│   ├── App.css                 # App styling
│   └── index.js                # React entry point
├── public/
│   └── index.html              # HTML template
├── package.json                # Dependencies
└── README.md                   # This file
```

## API Endpoints 🔌

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Fetch all todos |
| POST | `/api/todos` | Create a new todo |
| PATCH | `/api/todos/:id` | Update a todo (mark complete, edit) |
| DELETE | `/api/todos/:id` | Delete a todo |
| GET | `/health` | Server health check |

## Usage Guide

### Adding a Todo
1. Type your task in the input field at the top
2. Click "Add" or press Enter
3. The todo appears at the top of your list

### Marking as Complete
- Click the checkbox next to any todo to mark it complete
- Completed todos appear with strikethrough text

### Editing a Todo
- Double-click on any todo text to edit it
- Press Enter to save or Escape to cancel

### Deleting a Todo
- Click the "✕" button on the right side of any todo

### Filtering Todos
- **All** - Shows all todos
- **Active** - Shows only incomplete todos
- **Completed** - Shows only completed todos

## Database Schema

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server (runs on port 5000):**
   ```bash
   npm start
   ```

3. **In another terminal, start the development server (runs on port 3000):**
   ```bash
   npm run client
   ```

4. **Or run both simultaneously:**
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Development Commands

- `npm run dev` - Start both backend and frontend servers
- `npm start` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm test` - Run tests

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- **Initial Load**: ~2s with hot cache
- **API Response**: <100ms typical
- **Database**: SQLite for instant local access
- **UI**: Smooth animations and transitions

## Future Enhancements 🚀

- [ ] User authentication
- [ ] Due dates and priorities
- [ ] Task categories/tags
- [ ] Recurring todos
- [ ] Dark mode
- [ ] PWA support
- [ ] Collaboration features
- [ ] Email reminders

## License

MIT License - Feel free to use this project for anything!

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
