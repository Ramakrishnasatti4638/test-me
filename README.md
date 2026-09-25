# SnapURL — URL Shortener

A small, self-contained URL shortener built with Node.js, Express, and a vanilla-JS frontend.

## Features
- Paste a long URL, get a short link back
- Optional custom aliases (e.g. `/my-link`)
- Persistent JSON storage (no external DB required)
- Click counter on every redirect
- List, copy, and delete links from the UI
- JSON API: `POST /api/shorten`, `GET /api/links`, `GET /api/links/:code`, `DELETE /api/links/:code`

## Run
```
npm install
npm start
```
Then visit the printed URL in your browser.

## Notes
- Short codes are 7 chars from a URL-safe alphabet (no ambiguous chars).
- Data is stored in `data/links.json`. Delete it to reset.
- The server validates URLs and aliases; rejects non-http(s) schemes.
