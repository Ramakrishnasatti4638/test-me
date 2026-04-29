(() => {
  // ── State ──────────────────────────────────────────────────
  let todos  = JSON.parse(localStorage.getItem('todos') || '[]');
  let filter = 'all'; // 'all' | 'active' | 'completed'

  // ── DOM refs ───────────────────────────────────────────────
  const form          = document.getElementById('todo-form');
  const input         = document.getElementById('todo-input');
  const list          = document.getElementById('todo-list');
  const footer        = document.getElementById('todo-footer');
  const itemsLeft     = document.getElementById('items-left');
  const clearBtn      = document.getElementById('clear-completed');
  const filterBtns    = document.querySelectorAll('.filter-btn');

  // ── Persistence ────────────────────────────────────────────
  function save() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // ── Render ─────────────────────────────────────────────────
  function render() {
    list.innerHTML = '';

    const visible = todos.filter(t => {
      if (filter === 'active')    return !t.done;
      if (filter === 'completed') return  t.done;
      return true;
    });

    if (visible.length === 0) {
      list.innerHTML = `
        <li class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <p>${filter === 'completed' ? 'No completed todos yet.' :
               filter === 'active'    ? 'Nothing left to do!' :
               'Add your first todo above.'}</p>
        </li>`;
    } else {
      visible.forEach(todo => list.appendChild(createItem(todo)));
    }

    // footer
    const activeCount     = todos.filter(t => !t.done).length;
    const completedCount  = todos.filter(t =>  t.done).length;
    const label           = activeCount === 1 ? 'item left' : 'items left';

    itemsLeft.textContent = `${activeCount} ${label}`;
    clearBtn.style.display = completedCount > 0 ? 'inline' : 'none';
    footer.classList.toggle('hidden', todos.length === 0);
  }

  function createItem(todo) {
    const li = document.createElement('li');
    li.className = `todo-item${todo.done ? ' completed' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-check" ${todo.done ? 'checked' : ''}
             aria-label="Mark as ${todo.done ? 'incomplete' : 'complete'}"/>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="delete-btn" aria-label="Delete todo">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </button>`;

    li.querySelector('.todo-check').addEventListener('change', () => toggle(todo.id));
    li.querySelector('.delete-btn').addEventListener('click', () => remove(todo.id));

    return li;
  }

  // ── Actions ────────────────────────────────────────────────
  function addTodo(text) {
    todos.push({ id: Date.now(), text: text.trim(), done: false });
    save();
    render();
  }

  function toggle(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) { todo.done = !todo.done; save(); render(); }
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

  // ── Events ─────────────────────────────────────────────────
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) { addTodo(text); input.value = ''; }
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

  // ── Utility ────────────────────────────────────────────────
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Init ───────────────────────────────────────────────────
  render();
})();
