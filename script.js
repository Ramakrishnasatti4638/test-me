(function () {
  "use strict";

  const STORAGE_KEY = "todos:v1";

  /** @type {{id: string, text: string, done: boolean}[]} */
  let todos = loadTodos();

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function createId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    list.innerHTML = "";

    if (todos.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }
    emptyState.classList.add("hidden");

    const frag = document.createDocumentFragment();

    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.done ? " done" : "");
      li.dataset.id = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "todo-checkbox";
      checkbox.checked = todo.done;
      checkbox.setAttribute(
        "aria-label",
        todo.done ? "Mark as not done" : "Mark as done"
      );
      checkbox.addEventListener("change", () => toggleTodo(todo.id));

      const span = document.createElement("span");
      span.className = "todo-text";
      span.innerHTML = escapeHtml(todo.text);

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("aria-label", "Delete todo");
      deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteBtn);
      frag.appendChild(li);
    });

    list.appendChild(frag);
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.push({ id: createId(), text: trimmed, done: false });
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    todo.done = !todo.done;
    saveTodos();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    render();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = "";
    input.focus();
  });

  render();
})();
