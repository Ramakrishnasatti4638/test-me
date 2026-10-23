// Todo state and functionality
(function () {
  const STORAGE_KEY = 'simple_todos_app_data';

  // State management using TodoStore or fallback
  let store;

  function loadSavedTodos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load todos from localStorage', e);
      return [];
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.todos));
    } catch (e) {
      console.error('Failed to save todos to localStorage', e);
    }
  }

  // DOM Elements
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');
  const itemsLeft = document.getElementById('items-left');
  const completionStat = document.getElementById('completion-stat');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const filterButtons = document.querySelectorAll('.filter-btn');

  let currentFilter = 'all';

  function render() {
    const filteredTodos = store.filter(currentFilter);

    // Clear list
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      filteredTodos.forEach((todo) => {
        const li = document.createElement('li');
        li.className = `todo-item${todo.completed ? ' completed' : ''}`;
        li.dataset.id = todo.id;

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`);
        checkbox.addEventListener('change', () => {
          store.toggle(todo.id);
          saveTodos();
          render();
        });

        // Task Text
        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;

        // Actions wrapper
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'todo-actions';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('aria-label', `Edit "${todo.text}"`);
        editBtn.addEventListener('click', () => {
          const newText = window.prompt('Edit task:', todo.text);
          if (newText !== null && newText.trim() !== '') {
            store.edit(todo.id, newText);
            saveTodos();
            render();
          }
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.setAttribute('aria-label', `Delete "${todo.text}"`);
        deleteBtn.addEventListener('click', () => {
          store.delete(todo.id);
          saveTodos();
          render();
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(actionsDiv);

        todoList.appendChild(li);
      });
    }

    // Update Footer stats
    const stats = store.getStats();
    itemsLeft.textContent = `${stats.active} item${stats.active === 1 ? '' : 's'} left`;
    completionStat.textContent = `${stats.percentage}% done`;
  }

  // Initialize store
  if (typeof TodoStore !== 'undefined') {
    store = new TodoStore(loadSavedTodos());
  } else {
    // Fallback if TodoStore script is missing
    store = {
      todos: loadSavedTodos(),
      add(text) {
        if (!text.trim()) return;
        this.todos.push({ id: Date.now().toString(), text: text.trim(), completed: false });
      },
      toggle(id) {
        const t = this.todos.find(x => x.id === id);
        if (t) t.completed = !t.completed;
      },
      delete(id) {
        this.todos = this.todos.filter(x => x.id !== id);
      },
      edit(id, text) {
        const t = this.todos.find(x => x.id === id);
        if (t) t.text = text.trim();
      },
      clearCompleted() {
        this.todos = this.todos.filter(x => !x.completed);
      },
      filter(f) {
        if (f === 'active') return this.todos.filter(x => !x.completed);
        if (f === 'completed') return this.todos.filter(x => x.completed);
        return this.todos;
      },
      getStats() {
        const active = this.todos.filter(x => !x.completed).length;
        const completed = this.todos.length - active;
        const percentage = this.todos.length === 0 ? 0 : Math.round((completed / this.todos.length) * 100);
        return { total: this.todos.length, active, completed, percentage };
      }
    };
  }

  // Event Listeners
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input.value.trim()) {
        store.add(input.value);
        saveTodos();
        input.value = '';
        render();
      }
    });
  }

  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
      store.clearCompleted();
      saveTodos();
      render();
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  render();
})();
