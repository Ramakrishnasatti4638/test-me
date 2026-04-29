(() => {
  // ── State ──────────────────────────────────────────────────────────
  const STORAGE_KEY = 'todos-v1';

  let todos  = load();
  let filter = 'all'; // 'all' | 'active' | 'completed'

  // ── DOM refs ───────────────────────────────────────────────────────
  const form        = document.getElementById('todo-form');
  const input       = document.getElementById('todo-input');
  const list        = document.getElementById('todo-list');
  const footer      = document.getElementById('todo-footer');
  const itemsLeft   = document.getElementById('items-left');
  const clearBtn    = document.getElementById('clear-completed');
  const filterBtns  = document.querySelectorAll('.filter-btn');

  // ── Persistence ────────────────────────────────────────────────────
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  // ── Helpers ────────────────────────────────────────────────────────
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function filteredTodos() {
    if (filter === 'active')    return todos.filter(t => !t.done);
    if (filter === 'completed') return todos.filter(t =>  t.done);
    return todos;
  }

  // ── Render ─────────────────────────────────────────────────────────
  function render() {
    const visible = filteredTodos();

    list.innerHTML = '';

    visible.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.done ? ' completed' : '');
      li.dataset.id = todo.id;

      // Checkbox
      const cb = document.createElement('input');
      cb.type      = 'checkbox';
      cb.className = 'todo-check';
      cb.checked   = todo.done;
      cb.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.done ? 'active' : 'completed'}`);
      cb.addEventListener('change', () => toggle(todo.id));

      // Text
      const span = document.createElement('span');
      span.className   = 'todo-text';
      span.textContent = todo.text;

      // Delete button
      const del = document.createElement('button');
      del.className = 'delete-btn';
      del.setAttribute('aria-label', `Delete "${todo.text}"`);
      del.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
      </svg>`;
      del.addEventListener('click', () => remove(todo.id));

      li.append(cb, span, del);
      list.appendChild(li);
    });

    updateFooter();
  }

  function updateFooter() {
    const activeCount     = todos.filter(t => !t.done).length;
    const completedCount  = todos.filter(t =>  t.done).length;

    if (todos.length === 0) {
      footer.classList.add('hidden');
      return;
    }

    footer.classList.remove('hidden');
    itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
    clearBtn.style.visibility = completedCount > 0 ? 'visible' : 'hidden';
  }

  // ── Actions ────────────────────────────────────────────────────────
  function addTodo(text) {
    todos.unshift({ id: uid(), text, done: false });
    save();
    render();
  }

  function toggle(id) {
    todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    save();
    render();
  }

  function remove(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  function clearCompleted() {
    todos = todos.filter(t => !t.done);
    save();
    render();
  }

  function setFilter(f) {
    filter = f;
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === f);
    });
    render();
  }

  // ── Events ─────────────────────────────────────────────────────────
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
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // ── Boot ───────────────────────────────────────────────────────────
  render();
})();
