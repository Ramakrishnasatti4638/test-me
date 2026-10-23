# Simple Todo App

A responsive, lightweight, and modern Todo web application built with vanilla HTML, CSS, and JavaScript.

## Features

- **Add Tasks**: Quickly create tasks with input validation.
- **Toggle Completion**: Mark tasks done or active with a single click.
- **Edit Tasks**: Update existing task descriptions on the fly.
- **Delete Tasks**: Remove individual items or clear all completed tasks at once.
- **Filter Views**: Easily toggle between **All**, **Active**, and **Completed** tasks.
- **Progress & Metrics**: Live counter for pending items and percentage completion.
- **Persistent Storage**: Saves tasks in `localStorage` so your checklist persists across page reloads.
- **Accessible & Responsive**: Keyboard and screen-reader accessible with clean typography and fluid styling.

## Project Structure

- `index.html`: Web application structure and markup.
- `style.css`: Clean, modern styling and responsive card design.
- `todo-store.js`: Modular todo data management logic (add, edit, toggle, filter, stats).
- `app.js`: DOM event binding and localStorage persistence layer.
- `test.js`: Unit test suite testing data manipulation and statistics.
- `package.json`: Project scripts including automated tests.

## Testing

Run tests using Node's built-in test runner:

```bash
npm test
```
