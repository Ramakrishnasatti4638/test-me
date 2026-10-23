document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'simple_todo_items';

  let todos = loadTodos();
  let currentFilter = 'all';

  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const itemsLeft = document.getElementById('items-left');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  function loadTodos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos:', e);
    }
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newTodo = {
      id: Date.now().toString(),
      text: trimmed,
      completed: false,
    };

    todos.push(newTodo);
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
      emptyLi.textContent = todos.length === 0 ? 'No tasks yet. Add one above!' : 'No tasks in this filter.';
      todoList.appendChild(emptyLi);
    } else {
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

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.setAttribute('aria-label', `Delete task "${todo.text}"`);
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(deleteBtn);

        todoList.appendChild(li);
      });
    }

    const activeCount = todos.filter(t => !t.completed).length;
    itemsLeft.textContent = `${activeCount} item${activeCount === 1 ? '' : 's'} left`;
  }

  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(todoInput.value);
    todoInput.value = '';
    todoInput.focus();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  render();
});
