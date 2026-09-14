# URL Shortener App

A full-stack URL shortener application built with Node.js/Express and vanilla JavaScript.

## Features

- ✨ **Create Short URLs** - Convert long URLs into short, shareable links
- 📊 **Click Tracking** - Monitor how many times each short URL is clicked
- 💾 **SQLite Database** - Persistent storage of all shortened URLs
- 🎨 **Modern UI** - Clean, responsive, gradient-based interface
- 🚀 **REST API** - Full API for URL management
- 📋 **URL History** - View all your shortened URLs with their statistics

## API Endpoints

### POST `/api/shorten`
Create a new short URL.

**Request:**
```json
{
  "url": "https://example.com/very/long/url"
}
```

**Response:**
```json
{
  "shortId": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://example.com/very/long/url"
}
```

### GET `/api/urls`
Get all shortened URLs.

**Response:**
```json
[
  {
    "id": "abc123",
    "original_url": "https://example.com/very/long/url",
    "created_at": "2024-01-15 10:30:00",
    "click_count": 5
  }
]
```

### GET `/api/urls/:id`
Get details of a specific short URL.

### GET `/:id`
Redirect to the original URL and increment click count.

## Project Structure

```
url-shortener/
├── server.js          # Express server & API
├── public/
│   └── index.html     # Frontend (HTML, CSS, JavaScript)
├── urls.db            # SQLite database (auto-created)
├── package.json
└── README.md
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **ID Generation**: nanoid
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **CORS**: Enabled for cross-origin requests

## Installation & Running

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## How It Works

1. User enters a long URL in the input field
2. Frontend sends POST request to `/api/shorten`
3. Backend generates a unique 6-character ID using nanoid
4. URL is stored in SQLite database
5. Short URL is returned to frontend and displayed
6. When someone visits the short URL, it redirects to the original URL
7. Click count is incremented in the database

## Database Schema

```sql
CREATE TABLE urls (
  id TEXT PRIMARY KEY,
  original_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  click_count INTEGER DEFAULT 0
)
```

## Features in Detail

### URL Validation
- URLs are validated before being stored
- Invalid URLs are rejected with a clear error message

### Unique ID Generation
- Uses nanoid to generate 6-character unique IDs
- Extremely low collision probability

### Click Tracking
- Each redirect increments the click count
- View statistics for each shortened URL in the UI

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Beautiful gradient background and card-based layout

## Error Handling

The app handles various error scenarios:
- Missing or invalid URL input
- Malformed URLs
- Database errors
- Non-existent short URLs (404 responses)

All errors are displayed to the user in a user-friendly format.
