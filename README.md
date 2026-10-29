# Simple Todo

A clean, dependency-free todo app. Add tasks, mark them complete, filter by
status, and delete them. Everything persists to `localStorage`, so your list
survives a page reload.

## Features

- Add todos with the input box (press Enter or click **Add**)
- Mark a todo complete by clicking the circle or the text
- Delete a todo with the **×** button
- Filter by **All**, **Active**, or **Completed**
- Live "N items left" counter
- Persisted to `localStorage` — survives reloads
- Light/dark theme that follows your OS setting
- Keyboard accessible: the checkbox is focusable and toggles with Space/Enter

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Markup for the app shell, form, filters, list and footer |
| `styles.css` | All styling, including the dark-mode theme via `prefers-color-scheme` |
| `app.js` | Application logic: state, rendering, persistence and event wiring |
| `test.js` | Test suite (runs in Node with jsdom) |

## Running it

Any static file server works — there is no build step and no runtime
dependencies. From the project root:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. You can also just open
`index.html` directly from disk.

## Tests

```
npm install
npm test
```

The suite mounts the real `index.html` + `app.js` in jsdom and covers adding,
trimming, blank-input rejection, XSS-safe rendering, toggling, filtering,
deleting, the counter, `localStorage` persistence across a
reload, corrupt/malformed stored data, and keyboard accessibility.
