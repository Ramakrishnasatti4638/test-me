const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const root = __dirname;
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log("  PASS: " + msg);
  } else {
    failed++;
    console.log("  FAIL: " + msg);
  }
}

/**
 * Boot a fresh instance of the app.
 * @param {{ storage?: Map<string,string>, corrupt?: boolean }} opts
 */
function createApp(opts = {}) {
  const store = opts.storage || new Map();
  const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" });
  const { window } = dom;
  const { document } = window;

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    },
  });

  window.eval(appJs);

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const api = {
    window,
    document,
    store,
    $,
    $$,
    items: () => $$(".todo-item"),
    texts: () => $$(".todo-item .todo-text").map((n) => n.textContent),
    add(text) {
      $("#todo-input").value = text;
      $("#todo-form").dispatchEvent(
        new window.Event("submit", { bubbles: true, cancelable: true })
      );
    },
    click(sel, index = 0) {
      $$(sel)[index].dispatchEvent(new window.Event("click", { bubbles: true }));
    },
    submit() {
      $("#todo-form").dispatchEvent(
        new window.Event("submit", { bubbles: true, cancelable: true })
      );
    },
  };
  return api;
}

function section(name) {
  console.log("\n== " + name + " ==");
}

// ---------------------------------------------------------------- adding
section("Adding todos");
{
  const app = createApp();
  app.add("Buy milk");
  app.add("  Walk the dog  ");
  assert(app.items().length === 2, "two todos rendered");
  assert(app.texts()[0] === "Buy milk", "first todo text correct");
  assert(app.texts()[1] === "Walk the dog", "leading/trailing whitespace trimmed");
  assert(app.$("#todo-input").value === "", "input cleared after add");
  assert(app.$("#counter").textContent === "2 items left", "counter shows 2 items left");
  assert(app.$("#empty-state").hidden === true, "empty state hidden when todos exist");
  assert(app.$("#empty-state").textContent === "No todos here yet.", "initial empty state message");
}

section("Blank input is rejected");
{
  const app = createApp();
  app.add("   ");
  app.add("");
  assert(app.items().length === 0, "whitespace-only and empty input add nothing");
  assert(app.$("#counter").textContent === "0 items left", "counter shows 0 items left");
}

section("Todo text is inserted as text, not HTML (XSS-safe)");
{
  const app = createApp();
  app.add('<img src=x onerror="window.__pwned=1">');
  assert(app.items().length === 1, "todo added");
  assert(app.items()[0].querySelector("img") === null, "no img element injected");
  assert(
    app.texts()[0] === '<img src=x onerror="window.__pwned=1">',
    "markup preserved as literal text"
  );
  assert(app.window.__pwned === undefined, "injected script did not execute");
}

// ---------------------------------------------------------------- toggling
section("Toggling completion");
{
  const app = createApp();
  app.add("Buy milk");
  app.click(".todo-checkbox");
  assert(app.items()[0].classList.contains("completed"), "todo marked completed");
  assert(app.$("#counter").textContent === "0 items left", "counter shows 0 items left");
  assert(
    app.items()[0].querySelector(".todo-checkbox").getAttribute("aria-checked") === "true",
    "aria-checked updated to true"
  );
  app.click(".todo-text");
  assert(!app.items()[0].classList.contains("completed"), "clicking the text toggles back");
  assert(app.$("#counter").textContent === "1 item left", "counter back to 1 item left");
}

section("Counter uses singular for one item");
{
  const app = createApp();
  app.add("Only one");
  assert(app.$("#counter").textContent === "1 item left", "singular form used");
}

// ---------------------------------------------------------------- filters
section("Filters");
{
  const app = createApp();
  app.add("Buy milk");
  app.add("Walk the dog");
  app.click(".todo-checkbox"); // complete "Buy milk"

  app.click(".filter", 1); // active
  assert(app.items().length === 1, "active filter shows only incomplete todo");
  assert(app.texts()[0] === "Walk the dog", "active filter shows correct todo");
  assert(app.$(".filter.active").dataset.filter === "active", "active filter button highlighted");
  assert(
    app.$(".filter.active").getAttribute("aria-selected") === "true",
    "aria-selected updated on filter"
  );

  app.click(".filter", 2); // completed
  assert(app.items().length === 1, "completed filter shows only completed todo");
  assert(app.texts()[0] === "Buy milk", "completed filter shows correct todo");
  assert(app.$("#empty-state").hidden === true, "empty state hidden when filter has results");

  app.click(".filter", 0); // all
  assert(app.items().length === 2, "all filter shows both todos");
  assert(app.$(".filter.active").dataset.filter === "all", "all filter button highlighted");
}

section("Filter empty states");
{
  const app = createApp();
  app.add("Active one");
  app.click(".filter", 2); // completed -> nothing
  assert(app.$("#empty-state").hidden === false, "empty state visible for empty filter");
  assert(app.$("#empty-state").textContent === "No completed todos.", "correct message for completed filter");

  app.click(".filter", 0);
  assert(app.$("#empty-state").hidden === true, "empty state hidden again on all filter");
}

// ---------------------------------------------------------------- deleting
section("Deleting a todo");
{
  const app = createApp();
  app.add("Keep me");
  app.add("Delete me");
  app.click(".delete-btn", 1);
  assert(app.items().length === 1, "todo deleted");
  assert(app.texts()[0] === "Keep me", "correct todo remains");
}

section("Deleting the last todo shows empty state");
{
  const app = createApp();
  app.add("Only one");
  app.click(".delete-btn");
  assert(app.items().length === 0, "last todo deleted");
  assert(app.$("#empty-state").hidden === false, "empty state shown after deleting last todo");
  assert(app.$("#empty-state").textContent === "No todos here yet.", "correct empty state message");
  assert(app.$("#counter").textContent === "0 items left", "counter shows 0 items left");
}

// -------------------------------------------------------- clear completed
section("Clear completed");
{
  const app = createApp();
  app.add("To be completed");
  app.add("To stay active");
  app.click(".todo-checkbox"); // complete the first one

  const clearBtn = app.$("#clear-completed");
  assert(clearBtn.disabled === false, "clear-completed enabled when a completed todo exists");
  clearBtn.dispatchEvent(new app.window.Event("click", { bubbles: true }));
  assert(app.items().length === 1, "only the completed todo was cleared");
  assert(app.texts()[0] === "To stay active", "the active todo survives clearing completed");
  assert(app.$("#counter").textContent === "1 item left", "counter shows 1 item left");
  assert(clearBtn.disabled === true, "clear-completed disabled when nothing completed");
}

section("Clear completed with nothing completed is a no-op");
{
  const app = createApp();
  app.add("Active one");
  const clearBtn = app.$("#clear-completed");
  assert(clearBtn.disabled === true, "clear-completed disabled with no completed todos");
  clearBtn.dispatchEvent(new app.window.Event("click", { bubbles: true }));
  assert(app.items().length === 1, "no todos removed");
}

// ------------------------------------------------------------ persistence
section("Persistence in localStorage");
{
  const app = createApp();
  app.add("Persisted task");
  const raw = app.store.get("simple-todo-app:v1");
  assert(!!raw, "data written to localStorage");
  const parsed = JSON.parse(raw);
  assert(Array.isArray(parsed) && parsed.length === 1, "localStorage holds one todo");
  assert(parsed[0].text === "Persisted task", "localStorage stores todo text");
  assert(
    typeof parsed[0].id === "string" && typeof parsed[0].completed === "boolean",
    "stored todo has id and completed fields"
  );
}

section("Reload restores todos");
{
  const storage = new Map();
  const first = createApp({ storage });
  first.add("Survives reload");
  first.click(".todo-checkbox");

  const second = createApp({ storage });
  assert(second.items().length === 1, "todo restored after reload");
  assert(second.texts()[0] === "Survives reload", "restored todo has correct text");
  assert(
    second.items()[0].classList.contains("completed"),
    "restored todo keeps its completed state"
  );
}

section("Corrupt localStorage is handled gracefully");
{
  const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" });
  Object.defineProperty(dom.window, "localStorage", {
    configurable: true,
    value: {
      getItem: () => "{{{not json",
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    },
  });
  dom.window.eval(appJs);
  const d = dom.window.document;
  assert(d.querySelectorAll(".todo-item").length === 0, "corrupt storage renders empty list without crashing");
  assert(d.querySelector("#empty-state").hidden === false, "empty state shown for corrupt storage");
}

section("Malformed todo entries are filtered out on load");
{
  const storage = new Map();
  storage.set(
    "simple-todo-app:v1",
    JSON.stringify([{ id: "a", text: "Good one", completed: false }, { id: 5 }, null, { foo: "bar" }])
  );
  const app = createApp({ storage });
  assert(app.items().length === 1, "invalid entries dropped, valid one kept");
  assert(app.texts()[0] === "Good one", "valid entry rendered");
}

// ---------------------------------------------------------- accessibility
section("Keyboard accessibility");
{
  const app = createApp();
  app.add("Keyboard todo");
  const cb = app.items()[0].querySelector(".todo-checkbox");
  assert(cb.getAttribute("role") === "checkbox", "checkbox has role=checkbox");
  assert(cb.getAttribute("tabindex") === "0", "checkbox is keyboard focusable");
  assert(cb.getAttribute("aria-label") !== null, "checkbox has an accessible label");
  cb.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: " ", bubbles: true }));
  assert(app.items()[0].classList.contains("completed"), "space key toggles todo");
  cb.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  assert(!app.items()[0].classList.contains("completed"), "enter key toggles todo back");
}

section("Delete button has an accessible label");
{
  const app = createApp();
  app.add("Labelled");
  const del = app.items()[0].querySelector(".delete-btn");
  assert(del.getAttribute("aria-label") === "Delete todo", "delete button has aria-label");
  assert(del.getAttribute("type") === "button", "delete button type=button (no implicit submit)");
}

// ------------------------------------------------------------------ done
console.log(`\n========== ${passed} passed, ${failed} failed ==========\n`);
process.exit(failed === 0 ? 0 : 1);
