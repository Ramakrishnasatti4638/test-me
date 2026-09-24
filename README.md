# Shortly — URL Shortener

A minimal URL shortener built with Express. Paste a long URL, get a short
shareable link, and clicking the short link redirects to the original URL.

## Features

- `POST /api/shorten` — create a short link from a valid `http(s)` URL
- `GET /:code` — clicking a short link redirects (HTTP 302) to the original URL
- Clean, responsive frontend served from `public/`
- URL validation that rejects unsafe schemes (e.g. `javascript:`)
- Idempotent shortening (same URL returns the same code)

## API

| Method | Route            | Description                              |
|--------|------------------|------------------------------------------|
| POST   | `/api/shorten`   | Body `{ "url": "https://…" }` → `{ code, url, shortUrl }` |
| GET    | `/:code`         | Redirects (302) to the original URL      |

## Tests

Run the test suite:

```
npm test
```

The suite covers shortening, validation, idempotency, unknown codes, and the
key scenario: **clicking a short link redirects to the original URL**.
