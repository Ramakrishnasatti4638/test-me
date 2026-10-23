// Todo App State and Logic
(function () {
  const STORAGE_KEY = 'simple_todo_items';

  let todos = [];
  let currentFilter = 'all';

  // DOM Elements
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');
  const activeCountEl = document.getElementById('active-count');
  const totalSummaryEl = document.getElementById('total-summary');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const dateDisplay = document.getElementById('date-display');

  // Load from localStorage or defaults
  function loadTodos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        todos = JSON.parse(data);
      } else {
        // Initial sample tasks
        todos = [
          { id: '1', text: 'Welcome to your new Todo list!', completed: false, createdAt: Date.now() },
          { id: '2', text: 'Mark tasks complete by clicking the checkbox', completed: true, createdAt: Date.now() - 1000 },
          { id: '3', text: 'Add your own tasks above', completed: false, createdAt: Date.now() - 2000 }
        ];
        saveTodos();
      }
    } catch (e) {
      todos = [];
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos to localStorage', e);
    }
  }

  function setDateHeader() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const today = new Date().toLocaleDateString(undefined, options);
    if (dateDisplay) {
      dateDisplay.textContent = today;
    }
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newTodo = {
      id: Date.now().toString(),
      text: trimmed,
      completed: false,
      createdAt: Date.now()
    };

    todos.unshift(newTodo);
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    render();
  }

  function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    render();
  }

  function getFilteredTodos() {
    if (currentFilter === 'active') {
      return todos.filter(t => !t.completed);
    }
    if (currentFilter === 'completed') {
      return todos.filter(t => t.completed);
    }
    return todos;
  }

  function render() {
    const filtered = getFilteredTodos();
    todoList.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item${todo.completed ? ' completed' : ''}`;
        li.dataset.id = todo.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`);
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('aria-label', `Delete task "${todo.text}"`);
        deleteBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        `;
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);

        todoList.appendChild(li);
      });
    }

    // Update counts & stats
    const activeCount = todos.filter(t => !t.completed).length;
    activeCountEl.textContent = activeCount;

    const totalCount = todos.length;
    totalSummaryEl.textContent = `${totalCount} ${totalCount === 1 ? 'task' : 'tasks'} total`;

    // Filter active tab style
    filterBtns.forEach(btn => {
      const filter = btn.dataset.filter;
      const isActive = filter === currentFilter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  // Event Listeners
  todoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    addTodo(todoInput.value);
    todoInput.value = '';
    todoInput.focus();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearCompletedBtn.addEventListener('click', () => {
    clearCompleted();
  });

  // Initialization
  loadTodos();
  setDateHeader();
  render();
})();
