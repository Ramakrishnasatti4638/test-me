# Simple Todo App

A clean, modern, single-page todo application built with vanilla HTML, CSS, and JavaScript.

## Features

✨ **Core Functionality**
- ✅ Add new todos
- ✓ Mark todos as complete/incomplete
- 🗑️ Delete todos
- 🔍 Filter todos (All, Active, Completed)
- 📊 View stats (active and completed counts)

🎨 **User Experience**
- Modern, gradient-based UI with smooth animations
- Responsive design that works on desktop and mobile
- Real-time stats updates
- Empty state message when no todos exist
- Keyboard support (Enter key to add todos)
- Local storage persistence - todos are saved automatically

## How to Use

1. **Open the app** - Open `index.html` in your web browser
2. **Add a todo** - Type in the input field and click "Add" or press Enter
3. **Complete a todo** - Click the checkbox to mark it done
4. **Delete a todo** - Click the "Delete" button
5. **Filter todos** - Use the filter buttons to view All, Active, or Completed todos
6. **Your todos are saved** - All changes are automatically saved to your browser's local storage

## File Structure

```
├── index.html      # HTML structure and semantic markup
├── styles.css      # Modern CSS with gradients, animations, and responsive design
├── script.js       # TodoApp class with all business logic
└── README.md       # This file
```

## Technology Stack

- **HTML5** - Semantic markup and form elements
- **CSS3** - Flexbox layout, CSS variables, gradients, transitions, and animations
- **JavaScript (ES6+)** - Class-based architecture, localStorage API

## Customization

You can easily customize the app by editing:
- **Colors** - Change the CSS variables in `styles.css` (look for `:root`)
- **Initial todos** - Modify the `loadTodos()` method in `script.js`
- **UI text** - Edit strings in `index.html` and `script.js`

## Browser Support

Works on all modern browsers (Chrome, Firefox, Safari, Edge) that support:
- ES6 (ES2015) JavaScript
- CSS Custom Properties
- localStorage API
- Flexbox

Enjoy your todo app! 📝
