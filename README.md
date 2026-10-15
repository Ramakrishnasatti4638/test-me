# Todo App

A simple full-stack todo application built with React and Express.

## Features

- ✨ Add, complete, and delete todos
- 🎨 Modern, responsive UI with gradient design
- 📱 Mobile-friendly interface
- ⚡ Real-time updates
- 🔄 RESTful API backend

## Project Structure

```
todo-app/
├── server/
│   └── index.js          # Express server and API routes
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/   # React components (TodoInput, TodoList, TodoItem)
│       ├── App.js
│       ├── index.js
│       └── styles (CSS files)
├── package.json          # Root package.json
└── README.md
```

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo (toggle completion or edit text)
- `DELETE /api/todos/:id` - Delete a todo

## Technologies

- **Frontend**: React 18
- **Backend**: Express.js
- **Styling**: CSS3 with gradients and animations

## Development

Install dependencies and start the development server:

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

The React app will be available at `http://localhost:3000` and the API at `http://localhost:5000`.

## Production

Build the React app:

```bash
npm run build
```

Start the production server:

```bash
npm start
```
