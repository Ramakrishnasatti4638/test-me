// ── State ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'todo-app-items';

let todos  = loadTodos();
let filter = 'all';          // 'all' | 'active' | 'completed'

// ── DOM refs ───────────────────────────────────────────────────────────────
const form           = document.getElementById('todo-form');
const input          = document.getElementById('todo-input');
const list           = document.getElementById('todo-list');
const taskCountEl    = document.getElementById('task-count');
const completedCount = document.getElementById('completed-count');
const listFooter     = document.getElementById('list-footer');
const clearBtn       = document.getElementById('clear-completed');
const filterBtns     = document.querySelectorAll('.filter-btn');

// ── Persistence ────────────────────────────────────────────────────────────
function loadTodos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ── Helpers ────────────────────────────────────────────────────────────────
function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getVisible() {
  if (filter === 'active')    return todos.filter(t => !t.done);
  if (filter === 'completed') return todos.filter(t =>  t.done);
  return todos;
}

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  const visible   = getVisible();
  const remaining = todos.filter(t => !t.done).length;
  const done      = todos.filter(t =>  t.done).length;

  // Header counter
  taskCountEl.textContent =
    remaining === 1 ? '1 task remaining' : `${remaining} tasks remaining`;

  // Footer
  if (todos.length === 0) {
    listFooter.style.display = 'none';
  } else {
    listFooter.style.display = 'flex';
    completedCount.textContent = `${done} completed`;
  }

  // List items
  list.innerHTML = '';

  visible.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' completed' : '');
    li.dataset.id = todo.id;

    // Checkbox
    const cb = document.createElement('input');
    cb.type    = 'checkbox';
    cb.checked = todo.done;
    cb.setAttribute('aria-label', 'Toggle complete');
    cb.addEventListener('change', () => toggleTodo(todo.id));

    // Label (contenteditable for inline editing)
    const label = document.createElement('span');
    label.className = 'todo-label';
    label.textContent = todo.text;
    label.setAttribute('role', 'textbox');
    label.setAttribute('aria-label', 'Task text');
    label.contentEditable = true;

    label.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); label.blur(); }
      if (e.key === 'Escape') { label.textContent = todo.text; label.blur(); }
    });

    label.addEventListener('blur', () => {
      const newText = label.textContent.trim();
      if (newText && newText !== todo.text) {
        todo.text = newText;
        saveTodos();
        render();
      } else {
        label.textContent = todo.text; // revert
      }
    });

    // Delete button
    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'Delete task');
    del.addEventListener('click', () => deleteTodo(todo.id));

    li.append(cb, label, del);
    list.appendChild(li);
  });
}

// ── Actions ────────────────────────────────────────────────────────────────
function addTodo(text) {
  todos.unshift({ id: createId(), text, done: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) { todo.done = !todo.done; saveTodos(); render(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter(t => !t.done);
  saveTodos();
  render();
}

// ── Events ─────────────────────────────────────────────────────────────────
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = '';
  input.focus();
});

clearBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

// ── Init ───────────────────────────────────────────────────────────────────
render();
