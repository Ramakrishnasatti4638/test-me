# URL Shortener App

A simple, fast, and elegant URL shortener application built with Node.js/Express and vanilla JavaScript.

## Features

- **Shorten URLs** - Convert long URLs into compact 6-character short codes
- **Copy to Clipboard** - Easy one-click copying of shortened URLs
- **URL Validation** - Ensures URLs are properly formatted
- **Duplicate Detection** - Returns existing short URL if same link is submitted again
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Modern UI** - Clean, gradient-based interface with smooth animations

## Project Structure

```
.
├── server.js           # Express backend server
├── utils.js            # Utility functions
├── package.json        # Project dependencies
├── public/
│   ├── index.html      # Frontend HTML
│   ├── styles.css      # Styling
│   └── script.js       # Frontend JavaScript
└── README.md
```

## API Endpoints

### POST /api/shorten
Create a shortened URL.

**Request:**
```json
{
  "url": "https://example.com/very/long/path"
}
```

**Response:**
```json
{
  "shortId": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://example.com/very/long/path"
}
```

### GET /api/stats/:shortId
Get information about a shortened URL.

**Response:**
```json
{
  "shortId": "abc123",
  "originalUrl": "https://example.com/very/long/path",
  "shortUrl": "http://localhost:3000/abc123"
}
```

### GET /:shortId
Redirect to the original URL.

## How It Works

1. User enters a long URL in the web interface
2. Frontend sends POST request to `/api/shorten`
3. Backend generates a unique 6-character ID
4. Short URL is displayed and can be copied
5. When visiting `/:shortId`, the app redirects to the original URL

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Data Storage:** In-memory Map (suitable for demo/testing)

## Notes

- Short IDs are generated using alphanumeric characters (A-Z, a-z, 0-9)
- URLs are stored in memory and will be lost when the server restarts
- For production use, integrate with a persistent database
