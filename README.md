# URL Shortener

A fast and clean full-stack URL shortener built with Node.js + Express.

## Features

- Shorten any valid URL to a 6-character code
- One-click copy to clipboard
- Click tracking per shortened link
- Duplicate detection — same URL returns the same short code
- Links dashboard showing all created links with click counts

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** Vanilla HTML/CSS/JS (no frameworks)
- **Storage:** In-memory (resets on restart)

## Getting Started

```bash
npm install
npm start
```

Then open `http://localhost:3000` in your browser.

## API

| Method | Endpoint        | Description                      |
|--------|-----------------|----------------------------------|
| POST   | `/api/shorten`  | Create a short URL               |
| GET    | `/api/stats`    | List all shortened URLs          |
| GET    | `/:code`        | Redirect to the original URL     |

### POST `/api/shorten`

**Request body:**
```json
{ "url": "https://example.com/very/long/url" }
```

**Response:**
```json
{ "shortCode": "abc123", "originalUrl": "https://...", "clicks": 0 }
```
