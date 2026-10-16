# Todo App

A full-stack todo application built with React, Express, and Node.js.

## Features

- ✅ Create, read, update, and delete todos
- ✅ Mark todos as completed/incomplete
- ✅ Real-time UI updates
- ✅ Clean, modern UI with gradient background
- ✅ Responsive design
- ✅ Statistics showing total and completed todos

## Architecture

- **Frontend**: React 18 with Vite
- **Backend**: Express.js with CORS support
- **Data**: In-memory store (can be easily replaced with a database)

## Project Structure

```
.
├── server/
│   └── index.js           # Express server with API routes
├── client/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Client dependencies
└── package.json           # Root project config
```

## API Endpoints

### Get all todos
```
GET /api/todos
```

### Create a new todo
```
POST /api/todos
Content-Type: application/json

{ "text": "Your todo text" }
```

### Update a todo
```
PUT /api/todos/:id
Content-Type: application/json

{ "text": "Updated text", "completed": true }
```

### Delete a todo
```
DELETE /api/todos/:id
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation & Running

1. Install root dependencies:
   ```bash
   npm install
   ```

2. Install client dependencies:
   ```bash
   cd client && npm install && cd ..
   ```

3. Start both server and client:
   ```bash
   npm run dev
   ```

   Or run them separately:
   ```bash
   npm run dev:server    # Terminal 1
   npm run dev:client    # Terminal 2
   ```

## Production Build

```bash
npm run build
npm start
```

This will build the React app and serve it along with the API from the Express server.

## License

ISC
