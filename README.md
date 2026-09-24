# 🔗 Snip — URL Shortener

A minimal URL shortener built with **Express** and a lightweight vanilla-JS web UI.
Paste a long URL, get a short shareable link, and clicking that link redirects you
to the original destination.

## Features

- `POST /api/shorten` — create a short code for any valid `http(s)` URL
- `GET /:code` — clicking a short link redirects (302) to the original URL
- Clean, responsive single-page UI with copy-to-clipboard
- In-memory store (swap for a database in production)

## API

### Create a short link
```
POST /api/shorten
Content-Type: application/json

{ "url": "https://example.com/very/long/path" }
```
Response `201`:
```json
{ "code": "AbC1234", "url": "https://example.com/very/long/path", "shortUrl": "http://host/AbC1234" }
```

### Follow a short link
```
GET /:code   ->   302 Redirect to the original URL
```

## Tests

The Jest + Supertest suite covers link creation, validation, and — most importantly —
that **clicking a short link redirects to the original URL**:

```
npm test
```
