(function() {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const itemsLeft = document.getElementById('items-left');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let todos = [];
  let currentFilter = 'all';

  function loadTodos() {
    try {
      const saved = localStorage.getItem('todos');
      if (saved) {
        todos = JSON.parse(saved);
      }
    } catch (e) {
      todos = [];
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos to localStorage', e);
    }
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    todos.push({
      id: Date.now().toString(),
      text: trimmed,
      completed: false
    });

    saveTodos();
    render();
  }

  function toggleTodo(id) {
    todos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });

    saveTodos();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    render();
  }

  function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    render();
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
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
      const emptyLi = document.createElement('li');
      emptyLi.className = 'empty-state';
      emptyLi.textContent = currentFilter === 'all' 
        ? 'No tasks yet. Add one above!' 
        : `No ${currentFilter} tasks.`;
      todoList.appendChild(emptyLi);
    } else {
      filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item${todo.completed ? ' completed' : ''}`;

        const leftDiv = document.createElement('div');
        leftDiv.className = 'todo-item-left';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;

        leftDiv.appendChild(checkbox);
        leftDiv.appendChild(span);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('aria-label', 'Delete task');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(leftDiv);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
      });
    }

    const activeCount = todos.filter(t => !t.completed).length;
    itemsLeft.textContent = `${activeCount} item${activeCount === 1 ? '' : 's'} left`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setFilter(btn.dataset.filter);
    });
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  // Initial load & render
  loadTodos();
  render();
})();
