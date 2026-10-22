(() => {
  "use strict";

  const STORAGE_KEY = "todo-app:items";

  /** @type {{ id: string; text: string; done: boolean }[]} */
  let todos = load();

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const countEl = document.getElementById("count");
  const clearBtn = document.getElementById("clear-completed");

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function render() {
    list.innerHTML = "";

    if (todos.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No todos yet. Add one above!";
      list.appendChild(empty);
    } else {
      for (const todo of todos) {
        const li = document.createElement("li");
        if (todo.done) li.classList.add("done");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.done;
        checkbox.addEventListener("change", () => toggle(todo.id));

        const text = document.createElement("span");
        text.className = "text";
        text.textContent = todo.text;
        text.addEventListener("click", () => toggle(todo.id));

        const del = document.createElement("button");
        del.className = "delete";
        del.type = "button";
        del.textContent = "Delete";
        del.addEventListener("click", () => remove(todo.id));

        li.append(checkbox, text, del);
        list.appendChild(li);
      }
    }

    const remaining = todos.filter((t) => !t.done).length;
    countEl.textContent = `${remaining} ${remaining === 1 ? "item" : "items"} left`;
  }

  function add(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.push({ id: uid(), text: trimmed, done: false });
    save();
    render();
  }

  function toggle(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    todo.done = !todo.done;
    save();
    render();
  }

  function remove(id) {
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.done);
    save();
    render();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    add(input.value);
    input.value = "";
    input.focus();
  });

  clearBtn.addEventListener("click", clearCompleted);

  render();
})();