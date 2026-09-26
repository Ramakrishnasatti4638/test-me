# Shortener

A full-stack URL shortener built with Node.js, Express, and SQLite.

- **Backend:** Express + `better-sqlite3`
- **Frontend:** Plain HTML / CSS / vanilla JS (no build step)
- **Storage:** SQLite file at `data/shortener.db`

## Features

- Shorten any `http(s)` URL into a random 6-char code
- Optional custom alias (`/gh` → `https://github.com`)
- 301 redirects from `/{code}` to the original URL
- Click counter and last-clicked timestamp per link
- List, view, and delete links from the UI
- Defensive input validation on both client and server

## Run

```bash
npm install
npm start            # serves on http://localhost:3000
```

Override the port with `PORT=8080 npm start`.

## Test

```bash
npm test
```

Boots the app on a random port, hits it over HTTP, and runs 12 end-to-end
tests (create / redirect / list / delete / collision / static / etc.).

## API

| Method | Path                  | Body                                  | Description                          |
| ------ | --------------------- | ------------------------------------- | ------------------------------------ |
| POST   | `/api/shorten`        | `{ "url": "...", "code"?: "alias" }`  | Create a short link (201)             |
| GET    | `/api/links`          | —                                     | List the latest 200 links            |
| GET    | `/api/links/:code`    | —                                     | Fetch one link's details             |
| DELETE | `/api/links/:code`    | —                                     | Remove a link (204)                  |
| GET    | `/:code`              | —                                     | 301-redirect to the original URL     |

## Project layout

```
.
├── server.js          # Express app + API routes + redirect handler
├── db.js              # SQLite schema, helpers, validators
├── test.js            # End-to-end test runner
├── public/
│   ├── index.html     # Shortener UI
│   ├── app.js         # UI logic (fetch, render, copy, delete)
│   ├── styles.css     # Styles
│   └── 404.html       # Shown when a short code is unknown
└── data/              # Created on first run (gitignored)
    └── shortener.db
```