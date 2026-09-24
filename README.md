# 🔗 Snip — URL Shortener

A minimal URL shortener built with Express. Paste a long URL, get a short link,
and clicking the short link redirects to the original destination.

## Features

- `POST /api/shorten` — turn a long URL into a short code
- `GET /:code` — **click a short link and get redirected (302)** to the original URL
- `GET /api/stats/:code` — view how many times a short link was clicked
- Clean, responsive frontend served from `public/`
- In-memory store (swap `src/store.js` for a database to persist)

## Project structure

```
server.js          # starts the HTTP server
src/app.js         # Express app factory (shorten + redirect routes)
src/store.js       # in-memory code -> URL store
public/            # frontend (index.html, styles.css, app.js)
tests/app.test.js  # Jest + supertest suite
```

## Tests

The suite covers link creation, validation, and the core behaviour:
**clicking a short link redirects to the original URL** and each click is counted
as a hit.

```
npm test
```

## API example

```
POST /api/shorten
{ "url": "https://example.com/very/long/path" }

201 Created
{ "code": "aB3xY7z", "url": "https://example.com/very/long/path", "shortUrl": "http://<host>/aB3xY7z" }
```

Then visiting `http://<host>/aB3xY7z` responds with a `302` redirect to the
original URL.
