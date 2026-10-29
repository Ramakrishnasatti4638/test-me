(function () {
  "use strict";

  const STORAGE_KEY = "simple-todo-app:v1";
  const VALID_FILTERS = ["all", "active", "completed"];

  /** @type {{ id: string, text: string, completed: boolean, createdAt: number }[]} */
  let todos = [];
  let filter = "all";

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");
  const counter = document.getElementById("counter");
  const clearBtn = document.getElementById("clear-completed");
  const filterButtons = document.querySelectorAll(".filter");

  // ---------- Persistence ----------

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (t) =>
          t &&
          typeof t.id === "string" &&
          typeof t.text === "string" &&
          typeof t.completed === "boolean"
      );
    } catch (err) {
      console.warn("Failed to load todos:", err);
      return [];
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      console.warn("Failed to save todos:", err);
    }
  }

  // ---------- Helpers ----------

  function createId() {
    return (
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    );
  }

  function getFilteredTodos() {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }

  // ---------- Rendering ----------

  function render() {
    const visible = getFilteredTodos();
    list.innerHTML = "";

    if (visible.length === 0) {
      emptyState.hidden = false;
      emptyState.textContent =
        todos.length === 0
          ? "No todos here yet."
          : filter === "active"
          ? "No active todos."
          : "No completed todos.";
    } else {
      emptyState.hidden = true;
    }

    for (const todo of visible) {
      list.appendChild(renderItem(todo));
    }

    const remaining = todos.filter((t) => !t.completed).length;
    counter.textContent =
      remaining === 1 ? "1 item left" : remaining + " items left";
    clearBtn.disabled = !todos.some((t) => t.completed);
  }

  function renderItem(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("div");
    checkbox.className = "todo-checkbox" + (todo.completed ? " checked" : "");
    checkbox.setAttribute("role", "checkbox");
    checkbox.setAttribute("tabindex", "0");
    checkbox.setAttribute(
      "aria-checked",
      todo.completed ? "true" : "false"
    );
    checkbox.setAttribute("aria-label", "Toggle todo");
    checkbox.addEventListener("click", () => toggleTodo(todo.id));
    checkbox.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleTodo(todo.id);
      }
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    text.addEventListener("click", () => toggleTodo(todo.id));

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.setAttribute("aria-label", "Delete todo");
    del.textContent = "\u00d7";
    del.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(del);
    return li;
  }

  // ---------- Mutations ----------

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.push({
      id: createId(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    });
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    render();
  }

  function clearCompleted() {
    const hasCompleted = todos.some((t) => t.completed);
    if (!hasCompleted) return;
    todos = todos.filter((t) => !t.completed);
    saveTodos();
    render();
  }

  function setFilter(next) {
    if (!VALID_FILTERS.includes(next) || next === filter) return;
    filter = next;
    for (const btn of filterButtons) {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    }
    render();
  }

  // ---------- Wiring ----------

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = "";
    input.focus();
  });

  for (const btn of filterButtons) {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  }

  clearBtn.addEventListener("click", clearCompleted);

  // ---------- Init ----------

  todos = loadTodos();
  render();
})();
