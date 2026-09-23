# Snip — URL Shortener

A lightweight, full-stack URL shortener built with **Node.js + Express** and a clean, dark-themed frontend.

## Features

- **Shorten any URL** — paste a long URL and get a compact `/s/<code>` link
- **Custom codes** — optionally specify your own short code (e.g. `/s/my-link`)
- **Click tracking** — see how many times each link has been clicked
- **Delete links** — remove any short link from the list
- **Recent links panel** — all created links shown in a sortable table
- **One-click copy** — copy the short URL to clipboard instantly

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | Node.js, Express        |
| Frontend | Vanilla HTML / CSS / JS |
| Storage  | In-memory (Map)         |
| ID gen   | `nanoid` (6-char codes) |

## API

| Method | Endpoint           | Description                          |
|--------|--------------------|--------------------------------------|
| POST   | `/api/shorten`     | Create a short URL                   |
| GET    | `/api/urls`        | List all short URLs                  |
| DELETE | `/api/urls/:code`  | Delete a short URL                   |
| GET    | `/s/:code`         | Redirect to the original URL (301)   |

### POST `/api/shorten`

```json
{ "url": "https://example.com/long/path", "customCode": "my-link" }
```

Response:
```json
{ "shortCode": "my-link", "shortUrl": "/s/my-link" }
```
