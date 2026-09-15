# URL Shortener App

A modern, full-stack URL shortener application built with React, Express, and Node.js.

## Features

- **Create short URLs** - Convert long URLs into short, shareable links
- **Track clicks** - Monitor how many times each short URL has been accessed
- **Copy to clipboard** - Easily copy short URLs with a single click
- **Real-time updates** - See your shortened URLs instantly
- **Responsive design** - Works beautifully on desktop, tablet, and mobile devices

## Project Structure

```
url-shortener/
├── server/
│   └── index.js          # Express backend API
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── UrlForm.js      # URL input form component
│       │   └── UrlList.js      # Shortened URLs list component
│       ├── App.js              # Main React app
│       ├── App.css
│       └── index.js
└── package.json
```

## Tech Stack

**Frontend:**
- React 18
- CSS3 with modern styling
- Responsive design

**Backend:**
- Express.js
- CORS support
- nanoid for short ID generation

## API Endpoints

### GET `/api/urls`
Returns all shortened URLs.

**Response:**
```json
[
  {
    "shortId": "abc123",
    "shortUrl": "http://localhost:5000/s/abc123",
    "originalUrl": "https://example.com/very/long/url",
    "clicks": 5,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### POST `/api/shorten`
Creates a new shortened URL.

**Request:**
```json
{
  "originalUrl": "https://example.com/very/long/url"
}
```

**Response:**
```json
{
  "shortId": "abc123",
  "shortUrl": "http://localhost:5000/s/abc123",
  "originalUrl": "https://example.com/very/long/url",
  "clicks": 0,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### GET `/s/:shortId`
Redirects to the original URL and increments click count.

### GET `/api/urls/:shortId`
Returns details for a specific shortened URL.

## How It Works

1. **User submits a long URL** via the frontend form
2. **Backend validates** the URL format
3. **Generates a unique 6-character ID** using nanoid
4. **Stores the mapping** in memory (can be upgraded to a database)
5. **Returns the short URL** to the frontend
6. **User can copy and share** the short URL
7. **When short URL is accessed**, it redirects to the original URL and increments click count

## Notes

- URLs are stored in-memory, so they will be lost if the server restarts
- For production use, consider storing URLs in a database like MongoDB or PostgreSQL
- The short ID is randomly generated and unique per instance
- All timestamps are in UTC format
