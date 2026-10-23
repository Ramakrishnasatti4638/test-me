(() => {
  'use strict';

  const STORAGE_KEY = 'simple-todo-app:v1';

  /** @type {{id: string, text: string, done: boolean}[]} */
  let todos = [];
  let filter = 'all'; // 'all' | 'active' | 'completed'

  // ----- DOM -----
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const listEl = document.getElementById('todo-list');
  const emptyEl = document.getElementById('empty-state');
  const itemsLeftEl = document.getElementById('items-left');
  const clearBtn = document.getElementById('clear-completed');
  const filterButtons = Array.from(document.querySelectorAll('.filter'));
  const template = document.getElementById('todo-item-template');

  // ----- Storage -----
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Could not load todos from storage', err);
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      console.warn('Could not save todos to storage', err);
    }
  }

  // ----- Helpers -----
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }

  function visibleTodos() {
    if (filter === 'active') return todos.filter((t) => !t.done);
    if (filter === 'completed') return todos.filter((t) => t.done);
    return todos;
  }

  // ----- Rendering -----
  function render() {
    const visible = visibleTodos();

    listEl.innerHTML = '';

    for (const todo of visible) {
      const node = template.content.firstElementChild.cloneNode(true);
      node.dataset.id = todo.id;
      if (todo.done) node.classList.add('is-done');

      const checkbox = node.querySelector('.todo-item__checkbox');
      const textEl = node.querySelector('.todo-item__text');
      const deleteBtn = node.querySelector('.todo-item__delete');

      checkbox.checked = todo.done;
      textEl.textContent = todo.text;

      checkbox.addEventListener('change', () => toggle(todo.id, checkbox.checked));
      deleteBtn.addEventListener('click', () => remove(todo.id));

      listEl.appendChild(node);
    }

    const remaining = todos.filter((t) => !t.done).length;
    itemsLeftEl.textContent = `${remaining} ${remaining === 1 ? 'item' : 'items'} left`;

    const completedCount = todos.length - remaining;
    clearBtn.disabled = completedCount === 0;

    emptyEl.hidden = visible.length > 0;
  }

  // ----- Mutations -----
  function add(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.push({ id: uid(), text: trimmed, done: false });
    save();
    render();
  }

  function toggle(id, done) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    todo.done = done;
    save();
    render();
  }

  function remove(id) {
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
  }

  function clearCompleted() {
    const before = todos.length;
    todos = todos.filter((t) => !t.done);
    if (todos.length !== before) {
      save();
      render();
    }
  }

  function setFilter(next) {
    filter = next;
    for (const btn of filterButtons) {
      const isActive = btn.dataset.filter === next;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    }
    render();
  }

  // ----- Events -----
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    add(input.value);
    input.value = '';
    input.focus();
  });

  for (const btn of filterButtons) {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  }

  clearBtn.addEventListener('click', clearCompleted);

  // ----- Init -----
  todos = load();
  render();
})();