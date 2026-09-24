# Link Snip — URL Shortener

A small URL shortener built with Express and a lightweight vanilla-JS frontend.

## Features

- Shorten any valid `http(s)` URL into a compact code
- Click a short link to be **302-redirected** to the original URL
- Reuses the same code when an identical URL is shortened again
- Simple web UI to create, list, and copy short links

## API

| Method | Route            | Description                                  |
| ------ | ---------------- | -------------------------------------------- |
| POST   | `/api/shorten`   | Body `{ "url": "https://..." }` → short link |
| GET    | `/api/links`     | List all short links                         |
| GET    | `/:code`         | Redirect (302) to the original URL           |

## Project structure

```
src/app.js       Express app factory (exported for tests)
src/server.js    Starts the HTTP server
public/index.html  Frontend UI
test/app.test.js   Jest + Supertest tests
```

## Tests

The test suite (Jest + Supertest) covers shortening, validation, listing, and
the key behaviour: **clicking a short link redirects to the original URL**.
