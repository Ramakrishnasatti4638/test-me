(function () {
  "use strict";

  var STORAGE_KEY = "todo-app.items";

  var form = document.getElementById("todo-form");
  var input = document.getElementById("todo-input");
  var list = document.getElementById("todo-list");
  var emptyState = document.getElementById("empty-state");
  var itemCount = document.getElementById("item-count");
  var clearBtn = document.getElementById("clear-completed");
  var filterButtons = document.querySelectorAll(".filter-btn");

  var todos = load();
  var filter = "all";

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      /* storage unavailable — keep in-memory only */
    }
  }

  function addTodo(text) {
    todos.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      text: text,
      completed: false
    });
    save();
    render();
  }

  function toggleTodo(id) {
    todos = todos.map(function (t) {
      return t.id === id ? Object.assign({}, t, { completed: !t.completed }) : t;
    });
    save();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter(function (t) {
      return t.id !== id;
    });
    save();
    render();
  }

  function clearCompleted() {
    todos = todos.filter(function (t) {
      return !t.completed;
    });
    save();
    render();
  }

  function visibleTodos() {
    if (filter === "active") {
      return todos.filter(function (t) { return !t.completed; });
    }
    if (filter === "completed") {
      return todos.filter(function (t) { return t.completed; });
    }
    return todos;
  }

  function render() {
    var visible = visibleTodos();

    list.innerHTML = "";

    visible.forEach(function (todo) {
      var li = document.createElement("li");
      li.className = "todo-item" + (todo.completed ? " completed" : "");

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "todo-checkbox";
      checkbox.checked = todo.completed;
      checkbox.setAttribute("aria-label", "Toggle " + todo.text);
      checkbox.addEventListener("change", function () {
        toggleTodo(todo.id);
      });

      var span = document.createElement("span");
      span.className = "todo-text";
      span.textContent = todo.text;

      var del = document.createElement("button");
      del.type = "button";
      del.className = "delete-btn";
      del.textContent = "\u00d7";
      del.setAttribute("aria-label", "Delete " + todo.text);
      del.addEventListener("click", function () {
        deleteTodo(todo.id);
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(del);
      list.appendChild(li);
    });

    emptyState.hidden = visible.length !== 0;

    var remaining = todos.filter(function (t) { return !t.completed; }).length;
    itemCount.textContent = remaining + (remaining === 1 ? " item left" : " items left");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    addTodo(text);
    input.value = "";
    input.focus();
  });

  clearBtn.addEventListener("click", clearCompleted);

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filter = btn.getAttribute("data-filter");
      filterButtons.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      render();
    });
  });

  render();
})();
