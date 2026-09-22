# URL Shortener

A full-stack URL shortener app built with Node.js, Express, and vanilla JS.

## Features

- Shorten any `http`/`https` URL to a compact 7-character link
- One-click copy to clipboard
- Click tracking per short link
- Recent links history (session-based)
- Clean, modern dark-mode UI

## Tech Stack

- **Backend**: Node.js + Express
- **Storage**: In-memory (resets on server restart)
- **Frontend**: Vanilla HTML/CSS/JS (no framework)

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/shorten` | Create a short URL. Body: `{ "url": "https://..." }` |
| `GET`  | `/api/stats/:code` | Get click stats for a short code |
| `GET`  | `/:code` | Redirect to the original URL |

## Getting Started

```bash
npm install
npm start
```
