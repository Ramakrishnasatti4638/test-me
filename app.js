/* ── Todo App ──────────────────────────────────────────────────── */

const STORAGE_KEY = 'todos-app';

// ── State ──────────────────────────────────────────────────────────
let todos  = load();
let filter = 'all';

// ── Persistence ────────────────────────────────────────────────────
function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ── CRUD helpers ───────────────────────────────────────────────────
function addTodo(text) {
  text = text.trim();
  if (!text) return;
  todos.push({ id: Date.now(), text, completed: false });
  save();
  render();
}

function toggleTodo(id) {
  const t = todos.find(t => t.id === id);
  if (t) { t.completed = !t.completed; save(); render(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function updateTodoText(id, newText) {
  newText = newText.trim();
  if (!newText) { deleteTodo(id); return; }
  const t = todos.find(t => t.id === id);
  if (t) { t.text = newText; save(); render(); }
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  save();
  render();
}

// ── Filtered view ──────────────────────────────────────────────────
function visibleTodos() {
  if (filter === 'active')    return todos.filter(t => !t.completed);
  if (filter === 'completed') return todos.filter(t =>  t.completed);
  return todos;
}

// ── Render ─────────────────────────────────────────────────────────
function render() {
  const list    = document.getElementById('todo-list');
  const footer  = document.getElementById('todo-footer');
  const itemsEl = document.getElementById('items-left');
  const visible = visibleTodos();

  list.innerHTML = '';

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    const messages = {
      all:       ['📝', 'No tasks yet — add one above!'],
      active:    ['🎉', 'Nothing left to do!'],
      completed: ['📋', 'No completed tasks yet.'],
    };
    const [icon, msg] = messages[filter];
    empty.innerHTML = `<span>${icon}</span>${msg}`;
    list.appendChild(empty);
  } else {
    visible.forEach(todo => list.appendChild(createItem(todo)));
  }

  // Footer
  const activeCount = todos.filter(t => !t.completed).length;
  const hasCompleted = todos.some(t => t.completed);

  if (todos.length === 0) {
    footer.classList.add('hidden');
  } else {
    footer.classList.remove('hidden');
    itemsEl.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
    document.getElementById('clear-completed').style.visibility =
      hasCompleted ? 'visible' : 'hidden';
  }
}

// ── Build a single <li> ────────────────────────────────────────────
function createItem(todo) {
  const li = document.createElement('li');
  li.className = `todo-item${todo.completed ? ' completed' : ''}`;
  li.dataset.id = todo.id;

  // Checkbox
  const cb = document.createElement('input');
  cb.type      = 'checkbox';
  cb.className = 'todo-checkbox';
  cb.checked   = todo.completed;
  cb.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.completed ? 'active' : 'completed'}`);
  cb.addEventListener('change', () => toggleTodo(todo.id));

  // Label (double-click to edit)
  const label = document.createElement('span');
  label.className   = 'todo-label';
  label.textContent = todo.text;
  label.title       = 'Double-click to edit';
  label.addEventListener('dblclick', () => startEdit(li, todo));

  // Delete button
  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.innerHTML = '&#x2715;';
  del.setAttribute('aria-label', `Delete "${todo.text}"`);
  del.addEventListener('click', () => deleteTodo(todo.id));

  li.appendChild(cb);
  li.appendChild(label);
  li.appendChild(del);
  return li;
}

// ── Inline editing ─────────────────────────────────────────────────
function startEdit(li, todo) {
  const label = li.querySelector('.todo-label');
  const del   = li.querySelector('.delete-btn');

  const input = document.createElement('input');
  input.type      = 'text';
  input.className = 'todo-edit-input';
  input.value     = todo.text;
  input.setAttribute('aria-label', 'Edit task');

  label.replaceWith(input);
  del.style.opacity = '0';
  input.focus();
  input.select();

  const commit = () => updateTodoText(todo.id, input.value);

  input.addEventListener('blur',    commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { input.blur(); }
    if (e.key === 'Escape') { input.value = todo.text; input.blur(); }
  });
}

// ── Event wiring ───────────────────────────────────────────────────
document.getElementById('todo-form').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('todo-input');
  addTodo(input.value);
  input.value = '';
  input.focus();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
    });
    render();
  });
});

document.getElementById('clear-completed').addEventListener('click', clearCompleted);

// ── Boot ───────────────────────────────────────────────────────────
render();
