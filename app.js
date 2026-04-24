/**
 * Todo App — vanilla JS, localStorage persistence
 */

// ── State ──────────────────────────────────────────────────────────────────
let todos = [];
let currentFilter = 'all';

// ── DOM refs ───────────────────────────────────────────────────────────────
const form        = document.getElementById('todo-form');
const input       = document.getElementById('todo-input');
const list        = document.getElementById('todo-list');
const emptyState  = document.getElementById('empty-state');
const listFooter  = document.getElementById('list-footer');
const itemsLeft   = document.getElementById('items-left');
const clearBtn    = document.getElementById('clear-completed');
const filterBtns  = document.querySelectorAll('.filter-btn');

// ── Persistence ────────────────────────────────────────────────────────────
function loadTodos() {
  try {
    todos = JSON.parse(localStorage.getItem('todos')) || [];
  } catch {
    todos = [];
  }
}

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getFiltered() {
  if (currentFilter === 'active')    return todos.filter(t => !t.done);
  if (currentFilter === 'completed') return todos.filter(t => t.done);
  return todos;
}

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  const filtered = getFiltered();

  // Clear list
  list.innerHTML = '';

  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item${todo.done ? ' done' : ''}`;
    li.dataset.id = todo.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.done;
    checkbox.id = `cb-${todo.id}`;
    checkbox.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.done ? 'active' : 'completed'}`);
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    // Label
    const label = document.createElement('label');
    label.className = 'todo-label';
    label.htmlFor = `cb-${todo.id}`;
    label.textContent = todo.text;

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.setAttribute('aria-label', `Delete "${todo.text}"`);
    delBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4h6v2"/>
      </svg>`;
    delBtn.addEventListener('click', () => deleteTodo(todo.id, li));

    li.append(checkbox, label, delBtn);
    list.appendChild(li);
  });

  // Empty state
  const isEmpty = filtered.length === 0;
  emptyState.hidden = !isEmpty;

  // Footer
  const activeCount     = todos.filter(t => !t.done).length;
  const completedCount  = todos.filter(t => t.done).length;
  listFooter.hidden = todos.length === 0;
  itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
  clearBtn.hidden = completedCount === 0;
}

// ── Actions ────────────────────────────────────────────────────────────────
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.unshift({ id: generateId(), text: trimmed, done: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    saveTodos();
    render();
  }
}

function deleteTodo(id, liElement) {
  liElement.classList.add('removing');
  liElement.addEventListener('transitionend', () => {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    render();
  }, { once: true });
}

function clearCompleted() {
  todos = todos.filter(t => !t.done);
  saveTodos();
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  filterBtns.forEach(btn => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });
  render();
}

// ── Event listeners ────────────────────────────────────────────────────────
form.addEventListener('submit', e => {
  e.preventDefault();
  addTodo(input.value);
  input.value = '';
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

clearBtn.addEventListener('click', clearCompleted);

// ── Init ───────────────────────────────────────────────────────────────────
loadTodos();
render();
