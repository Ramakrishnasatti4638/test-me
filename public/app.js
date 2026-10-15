const API_URL = 'http://localhost:3001/api';

let currentFilter = 'all';
let todos = [];

// DOM Elements
const todoTitle = document.getElementById('todoTitle');
const todoDescription = document.getElementById('todoDescription');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const clearCompleted = document.getElementById('clearCompleted');

// Event Listeners
addBtn.addEventListener('click', addTodo);
todoTitle.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});
todoDescription.addEventListener('keypress', (e) => {
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

clearCompleted.addEventListener('click', clearCompletedTodos);

// Fetch todos from API
async function fetchTodos() {
    try {
        const response = await fetch(`${API_URL}/todos?filter=${currentFilter}`);
        if (!response.ok) throw new Error('Failed to fetch todos');
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}

// Add new todo
async function addTodo() {
    const title = todoTitle.value.trim();
    const description = todoDescription.value.trim();

    if (!title) {
        alert('Please enter a task title');
        todoTitle.focus();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });

        if (!response.ok) throw new Error('Failed to add todo');
        
        todoTitle.value = '';
        todoDescription.value = '';
        todoTitle.focus();
        
        fetchTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Failed to add todo');
    }
}

// Toggle todo completion
async function toggleTodo(id, completed) {
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !completed })
        });

        if (!response.ok) throw new Error('Failed to update todo');
        fetchTodos();
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update todo');
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete todo');
        fetchTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo');
    }
}

// Clear all completed todos
async function clearCompletedTodos() {
    if (!confirm('Delete all completed todos? This cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to clear completed todos');
        fetchTodos();
    } catch (error) {
        console.error('Error clearing completed todos:', error);
        alert('Failed to clear completed todos');
    }
}

// Render todos to DOM
function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            const date = new Date(todo.createdAt);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo('${todo.id}', ${todo.completed})"
                >
                <div class="todo-content">
                    <div class="todo-title">${escapeHtml(todo.title)}</div>
                    ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                    <div class="todo-meta">${formattedDate}</div>
                </div>
                <div class="todo-actions">
                    <button class="btn-delete" onclick="deleteTodo('${todo.id}')">Delete</button>
                </div>
            `;
            
            todoList.appendChild(li);
        });
    }

    updateStats();
}

// Update statistics
async function updateStats() {
    try {
        const response = await fetch(`${API_URL}/todos`);
        if (!response.ok) throw new Error('Failed to fetch todos');
        const allTodos = await response.json();

        const total = allTodos.length;
        const active = allTodos.filter(t => !t.completed).length;
        const completed = allTodos.filter(t => t.completed).length;

        totalCount.textContent = total;
        activeCount.textContent = active;
        completedCount.textContent = completed;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    fetchTodos();
    setInterval(updateStats, 5000);
});
