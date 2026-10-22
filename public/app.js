// DOM Elements
const titleInput = document.getElementById('titleInput');
const descriptionInput = document.getElementById('descriptionInput');
const addBtn = document.getElementById('addBtn');
const todosList = document.getElementById('todosList');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');

let todos = [];
let currentFilter = 'all';

// Initialize the app
async function init() {
  await fetchTodos();
  renderTodos();
  setupEventListeners();
}

// Fetch todos from the server
async function fetchTodos() {
  try {
    const response = await fetch('/api/todos');
    if (!response.ok) throw new Error('Failed to fetch todos');
    todos = await response.json();
  } catch (error) {
    console.error('Error fetching todos:', error);
    todos = [];
  }
}

// Add a new todo
async function addTodo() {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    alert('Please enter a todo title');
    return;
  }

  try {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) throw new Error('Failed to add todo');

    const newTodo = await response.json();
    todos.push(newTodo);

    // Clear inputs
    titleInput.value = '';
    descriptionInput.value = '';
    titleInput.focus();

    renderTodos();
  } catch (error) {
    console.error('Error adding todo:', error);
    alert('Failed to add todo');
  }
}

// Update a todo
async function updateTodo(id, updates) {
  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update todo');

    const updatedTodo = await response.json();
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
      todos[index] = updatedTodo;
    }

    renderTodos();
  } catch (error) {
    console.error('Error updating todo:', error);
    alert('Failed to update todo');
  }
}

// Delete a todo
async function deleteTodo(id) {
  if (!confirm('Are you sure you want to delete this todo?')) {
    return;
  }

  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete todo');

    todos = todos.filter(t => t.id !== id);
    renderTodos();
  } catch (error) {
    console.error('Error deleting todo:', error);
    alert('Failed to delete todo');
  }
}

// Toggle todo completion
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    updateTodo(id, { completed: !todo.completed });
  }
}

// Edit todo (open modal)
function editTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const newTitle = prompt('Edit title:', todo.title);
  if (newTitle !== null && newTitle.trim()) {
    const newDescription = prompt('Edit description:', todo.description);
    updateTodo(id, { 
      title: newTitle.trim(),
      description: newDescription || ''
    });
  }
}

// Render todos based on filter
function renderTodos() {
  const filtered = getFilteredTodos();
  updateStats();

  if (filtered.length === 0) {
    todosList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>${currentFilter === 'completed' ? 'No completed todos yet!' : 'No todos yet. Add one to get started!'}</p>
      </div>
    `;
    return;
  }

  todosList.innerHTML = filtered.map(todo => `
    <div class="todo-item ${todo.completed ? 'completed' : ''}">
      <input 
        type="checkbox" 
        class="checkbox" 
        ${todo.completed ? 'checked' : ''}
        onchange="toggleTodo(${todo.id})"
      >
      <div class="todo-content">
        <div class="todo-title">${escapeHtml(todo.title)}</div>
        ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
        <div class="todo-meta">Created: ${formatDate(todo.createdAt)}</div>
      </div>
      <div class="todo-actions">
        <button class="btn-edit" onclick="editTodo(${todo.id})">Edit</button>
        <button class="btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

// Get filtered todos
function getFilteredTodos() {
  if (currentFilter === 'active') {
    return todos.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    return todos.filter(t => t.completed);
  }
  return todos;
}

// Update statistics
function updateStats() {
  const completed = todos.filter(t => t.completed).length;
  const pending = todos.length - completed;

  totalCount.querySelector('strong').textContent = todos.length;
  completedCount.querySelector('strong').textContent = completed;
  pendingCount.querySelector('strong').textContent = pending;
}

// Setup event listeners
function setupEventListeners() {
  addBtn.addEventListener('click', addTodo);

  titleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Start the app
init();
