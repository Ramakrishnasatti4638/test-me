# Simple Todo App

A clean, modern web-based todo application with filtering and persistent storage.

## Features

- ✅ **Add Tasks** - Quickly add new tasks with the input field
- ✅ **Mark Complete** - Check off completed tasks
- ✅ **Delete Tasks** - Remove individual tasks
- ✅ **Filter View** - Switch between All, Active, and Completed tasks
- ✅ **Clear Completed** - Bulk delete all completed tasks
- ✅ **Persistent Storage** - Your tasks are saved in browser's local storage
- ✅ **Responsive Design** - Works great on desktop, tablet, and mobile
- ✅ **Modern UI** - Beautiful gradient background and smooth animations

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and responsive layout
- `script.js` - Application logic with TodoApp class
- `README.md` - This file

## Usage

Simply open `index.html` in any modern web browser. No installation or server required!

### How to Use

1. **Add a task** - Type in the input field and press Enter or click the Add button
2. **Mark as complete** - Click the checkbox next to a task to mark it done
3. **Delete a task** - Click the Delete button to remove a task
4. **Filter tasks** - Use the All/Active/Completed buttons to filter your view
5. **Clear completed** - Click "Clear Completed" to remove all finished tasks

## Technical Details

- Built with vanilla JavaScript (no dependencies)
- Uses `localStorage` for persistence
- ES6 class-based architecture
- Responsive design with CSS Grid/Flexbox
- Proper HTML escaping to prevent XSS vulnerabilities

## Browser Support

Works on all modern browsers that support:
- localStorage API
- ES6 JavaScript
- CSS Flexbox/Grid
