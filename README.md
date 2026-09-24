# 🔗 Snip — URL Shortener

A simple, self-contained URL shortener with an Express backend and a clean static frontend.

## Features

- Shorten any valid `http(s)` URL into a compact code
- Click a short link to be redirected (HTTP 302) to the original URL
- Per-link click counting
- Duplicate URLs reuse the same short code
- Modern, responsive UI with copy-to-clipboard

## Tech

- **Backend:** Node.js + Express
- **Short codes:** `nanoid`
- **Frontend:** vanilla HTML/CSS/JS (no build step)
- **Tests:** Jest + Supertest

## API

| Method | Route            | Description                                  |
| ------ | ---------------- | -------------------------------------------- |
| POST   | `/api/shorten`   | Body `{ "url": "https://..." }` → short link |
| GET    | `/api/links`     | List all short links with click counts       |
| GET    | `/:code`         | Redirect (302) to the original URL           |

## Testing

The test suite covers link creation, validation, click counting, and the core
**redirect-on-click** behaviour (a short link resolves to its original URL with a
302 redirect).
