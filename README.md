# URL Shortener

A full-stack URL shortener app built with Node.js and Express.

## Features

- Shorten any valid HTTP/HTTPS URL
- Instant redirect via short code
- Click tracking per link
- Link history with delete support
- Duplicate detection (same URL returns the same short code)
- Clean, responsive dark-themed UI

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JS (no build step)
- **Storage**: In-memory (resets on server restart)

## Usage

```bash
npm install
npm start
```

Then open `http://localhost:3000` in your browser.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/shorten` | Create a short URL. Body: `{ "url": "https://..." }` |
| `GET` | `/api/urls` | List all shortened URLs |
| `DELETE` | `/api/urls/:code` | Delete a shortened URL |
| `GET` | `/:code` | Redirect to the original URL |
