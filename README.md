# URL Shortener

A lightweight URL shortener built with Node.js, Express, and vanilla JS.

## Features

- Shorten any valid URL instantly
- One-click copy to clipboard
- Click tracking per link
- Recent links dashboard
- Clean, responsive dark UI

## Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JS (no build step)
- **Storage**: In-memory (resets on server restart)

## Usage

```bash
npm install
npm start
```

Then open the app in your browser.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/shorten` | Shorten a URL (`{ "url": "https://..." }`) |
| `GET`  | `/api/stats`   | List all shortened URLs with click counts |
| `GET`  | `/:code`       | Redirect to original URL |
