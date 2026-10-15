const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');

let todos = [];

// Fetch todos on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchTodos();
  todoInput.focus();
});

// Add todo on button click or Enter key
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTodo();
  }
});

async function fetchTodos() {
  try {
    const response = await fetch('/api/todos');
    todos = await response.json();
    render();
  } catch (error) {
    console.error('Error fetching todos:', error);
  }
}

async function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  try {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) throw new Error('Failed to add todo');
    
    const newTodo = await response.json();
    todos.push(newTodo);
    todoInput.value = '';
    todoInput.focus();
    render();
  } catch (error) {
    console.error('Error adding todo:', error);
    alert('Failed to add todo');
  }
}

async function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed })
    });
    
    if (!response.ok) throw new Error('Failed to update todo');
    
    const updated = await response.json();
    const index = todos.findIndex(t => t.id === id);
    todos[index] = updated;
    render();
  } catch (error) {
    console.error('Error updating todo:', error);
  }
}

async function deleteTodo(id) {
  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete todo');
    
    todos = todos.filter(t => t.id !== id);
    render();
  } catch (error) {
    console.error('Error deleting todo:', error);
  }
}

function render() {
  // Clear the list
  todoList.innerHTML = '';

  if (todos.length === 0) {
    emptyState.classList.add('show');
    totalCount.textContent = '0 total';
    completedCount.textContent = '0 completed';
    return;
  }

  emptyState.classList.remove('show');

  // Render each todo
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
    li.innerHTML = `
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${todo.completed ? 'checked' : ''}
      >
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="todo-delete">Delete</button>
    `;

    // Add event listeners
    li.querySelector('.todo-checkbox').addEventListener('change', () => {
      toggleTodo(todo.id);
    });

    li.querySelector('.todo-delete').addEventListener('click', () => {
      deleteTodo(todo.id);
    });

    todoList.appendChild(li);
  });

  // Update stats
  const completed = todos.filter(t => t.completed).length;
  totalCount.textContent = `${todos.length} total`;
  completedCount.textContent = `${completed} completed`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
