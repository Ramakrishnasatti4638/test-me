# URL Shortener

A full-stack URL shortener built with Node.js, Express, and vanilla JavaScript.

## Features
- Shorten any valid URL to a 6-character code
- Click a short link → redirects (301) to the original URL
- Recent links history panel
- Copy-to-clipboard button

## Project structure
```
├── server.js          # Express API (shorten + redirect + list)
├── index.js           # Server entry point
├── public/
│   └── index.html     # Frontend UI
└── tests/
    └── urlShortener.test.js  # Jest test suite
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/shorten` | Shorten a URL — body: `{ url }` |
| `GET`  | `/api/urls` | List all shortened URLs |
| `GET`  | `/:shortCode` | Redirect to original URL |

## Running tests

```bash
npm test
```

## Starting the server

```bash
npm start
```
