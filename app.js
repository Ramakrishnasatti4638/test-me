(() => {
  const STORAGE_KEY = 'codestudio-todos';

  // --- State ---
  let todos = load();
  let filter = 'all';

  // --- DOM refs ---
  const input     = document.getElementById('todo-input');
  const addBtn    = document.getElementById('add-btn');
  const list      = document.getElementById('todo-list');
  const footer    = document.getElementById('footer');
  const itemsLeft = document.getElementById('items-left');
  const clearBtn  = document.getElementById('clear-completed');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // --- Persistence ---
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  // --- Actions ---
  function addTodo(text) {
    text = text.trim();
    if (!text) return;
    todos.unshift({ id: Date.now(), text, completed: false });
    save();
    render();
    input.value = '';
    input.focus();
  }

  function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      save();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    save();
    render();
  }

  // --- Render ---
  function getFiltered() {
    if (filter === 'active')    return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function render() {
    const filtered = getFiltered();
    list.innerHTML = '';

    if (filtered.length === 0) {
      const messages = {
        all:       { icon: '📋', text: 'No tasks yet — add one above!' },
        active:    { icon: '✅', text: 'All tasks are completed!' },
        completed: { icon: '🗂️', text: 'No completed tasks yet.' },
      };
      const { icon, text } = messages[filter];
      list.innerHTML = `
        <li class="empty-state">
          <div style="font-size:2.5rem;margin-bottom:8px;">${icon}</div>
          <p>${text}</p>
        </li>`;
    } else {
      filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        li.dataset.id = todo.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-check';
        checkbox.checked = todo.completed;
        checkbox.setAttribute('aria-label', 'Mark task complete');
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.setAttribute('aria-label', 'Delete task');
        delBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>`;
        delBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBtn);
        list.appendChild(li);
      });
    }

    // Footer
    const activeCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;

    if (todos.length === 0) {
      footer.classList.add('hidden');
    } else {
      footer.classList.remove('hidden');
      itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
      clearBtn.style.visibility = completedCount > 0 ? 'visible' : 'hidden';
    }
  }

  // --- Event listeners ---
  addBtn.addEventListener('click', () => addTodo(input.value));

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTodo(input.value);
  });

  clearBtn.addEventListener('click', clearCompleted);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
  });

  // --- Init ---
  render();
})();
