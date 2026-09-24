(function () {
  "use strict";

  var STORAGE_KEY = "todo-app.items";

  var form = document.getElementById("todo-form");
  var input = document.getElementById("todo-input");
  var list = document.getElementById("todo-list");
  var counter = document.getElementById("counter");
  var emptyState = document.getElementById("empty-state");
  var clearBtn = document.getElementById("clear-completed");
  var filterBtns = document.querySelectorAll(".filters__btn");

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
      /* storage unavailable — ignore */
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
    todos.forEach(function (t) {
      if (t.id === id) t.completed = !t.completed;
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
    list.innerHTML = "";

    var items = visibleTodos();

    items.forEach(function (todo) {
      var li = document.createElement("li");
      li.className = "todo-item" + (todo.completed ? " is-completed" : "");

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "todo-item__checkbox";
      checkbox.checked = todo.completed;
      checkbox.setAttribute("aria-label", "Mark \"" + todo.text + "\" complete");
      checkbox.addEventListener("change", function () {
        toggleTodo(todo.id);
      });

      var span = document.createElement("span");
      span.className = "todo-item__text";
      span.textContent = todo.text;

      var del = document.createElement("button");
      del.className = "todo-item__delete";
      del.type = "button";
      del.innerHTML = "&times;";
      del.setAttribute("aria-label", "Delete \"" + todo.text + "\"");
      del.addEventListener("click", function () {
        deleteTodo(todo.id);
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(del);
      list.appendChild(li);
    });

    var remaining = todos.filter(function (t) { return !t.completed; }).length;
    counter.textContent = remaining + (remaining === 1 ? " item left" : " items left");

    emptyState.hidden = items.length !== 0;
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

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filter = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      render();
    });
  });

  render();
})();
