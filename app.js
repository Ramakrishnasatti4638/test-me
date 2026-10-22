(function () {
  "use strict";

  const STORAGE_KEY = "todo-app:v1";
  const FILTERS = ["all", "active", "completed"];

  /** @type {{id: string, text: string, done: boolean}[]} */
  let todos = loadTodos();
  let currentFilter = "all";

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const itemsLeft = document.getElementById("items-left");
  const clearBtn = document.getElementById("clear-completed");
  const filterButtons = document.querySelectorAll(".filters__btn");

  form.addEventListener("submit", onAdd);
  list.addEventListener("change", onToggle);
  list.addEventListener("click", onListClick);
  clearBtn.addEventListener("click", onClearCompleted);
  filterButtons.forEach((btn) =>
    btn.addEventListener("click", () => setFilter(btn.dataset.filter))
  );

  render();

  function onAdd(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    todos.push({ id: makeId(), text, done: false });
    input.value = "";
    save();
    render();
  }

  function onToggle(e) {
    const target = e.target;
    if (!target.classList.contains("todo-item__checkbox")) return;
    const li = target.closest(".todo-item");
    if (!li) return;
    const todo = todos.find((t) => t.id === li.dataset.id);
    if (!todo) return;
    todo.done = target.checked;
    save();
    render();
  }

  function onListClick(e) {
    const btn = e.target.closest(".todo-item__delete");
    if (!btn) return;
    const li = btn.closest(".todo-item");
    if (!li) return;
    todos = todos.filter((t) => t.id !== li.dataset.id);
    save();
    render();
  }

  function onClearCompleted() {
    todos = todos.filter((t) => !t.done);
    save();
    render();
  }

  function setFilter(filter) {
    if (!FILTERS.includes(filter)) return;
    currentFilter = filter;
    filterButtons.forEach((b) =>
      b.classList.toggle("is-active", b.dataset.filter === filter)
    );
    render();
  }

  function render() {
    const visible = todos.filter((t) => {
      if (currentFilter === "active") return !t.done;
      if (currentFilter === "completed") return t.done;
      return true;
    });

    list.innerHTML = "";
    if (visible.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-state";
      li.textContent = emptyMessage();
      list.appendChild(li);
    } else {
      for (const todo of visible) list.appendChild(renderItem(todo));
    }

    const remaining = todos.filter((t) => !t.done).length;
    itemsLeft.textContent = `${remaining} ${remaining === 1 ? "item" : "items"} left`;
    clearBtn.style.visibility = todos.some((t) => t.done) ? "visible" : "hidden";
  }

  function renderItem(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " is-done" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-item__checkbox";
    checkbox.checked = todo.done;
    checkbox.setAttribute("aria-label", `Mark "${todo.text}" as ${todo.done ? "active" : "completed"}`);

    const text = document.createElement("span");
    text.className = "todo-item__text";
    text.textContent = todo.text;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "todo-item__delete";
    del.setAttribute("aria-label", `Delete "${todo.text}"`);
    del.textContent = "\u00D7";

    li.append(checkbox, text, del);
    return li;
  }

  function emptyMessage() {
    if (todos.length === 0) return "Nothing here yet. Add your first task above.";
    if (currentFilter === "active") return "No active tasks. Nice work!";
    if (currentFilter === "completed") return "No completed tasks yet.";
    return "";
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (t) => t && typeof t.id === "string" && typeof t.text === "string" && typeof t.done === "boolean"
      );
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      /* storage may be unavailable; fail silently */
    }
  }
})();
