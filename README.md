# 🔗 Snip — URL Shortener

A small URL shortener built with an Express backend and a static frontend.
Paste a long URL, get a short link, and clicking that short link redirects
you to the original destination.

## Features

- **Shorten** any `http(s)` URL into a compact code.
- **Redirect** — clicking a short link (`/:code`) issues a `302` redirect to
  the original URL.
- **Click tracking** — each redirect increments a per-link click counter.
- **Duplicate-safe** — shortening the same URL twice returns the same code.
- Clean, responsive single-page frontend.

## API

| Method | Route            | Description                                  |
| ------ | ---------------- | -------------------------------------------- |
| POST   | `/api/shorten`   | Body `{ "url": "https://..." }` → new link   |
| GET    | `/api/links`     | List all links (most recent first)           |
| GET    | `/:code`         | Redirect (302) to the original URL           |

## Project structure

```
src/
  app.js      Express app factory (exported for tests)
  server.js   HTTP server entrypoint
  store.js    In-memory URL store
public/
  index.html  Frontend markup
  app.js       Frontend logic
  styles.css   Styling
tests/
  app.test.js  Jest + supertest tests (includes redirect-on-click)
```

## Tests

The suite uses Jest and supertest. The key case verifies redirect behavior:
when a short link is clicked, the server responds with a `302` redirect to the
original URL, and the click counter increments.
