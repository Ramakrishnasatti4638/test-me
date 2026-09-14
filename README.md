# URL Shortener App

A modern, full-stack URL shortener application built with React and Express.

## Features

✨ **Core Features:**
- Shorten long URLs into memorable short codes
- Copy short URLs to clipboard with one click
- View click statistics for each shortened URL
- Delete shortened URLs
- Sort URLs by creation date or click count
- Beautiful, responsive UI with gradient design

📊 **Backend Features:**
- SQLite database for URL storage
- RESTful API with comprehensive endpoints
- Click tracking for analytics
- Automatic short code generation
- CORS enabled for frontend integration

## Tech Stack

- **Frontend:** React 18, CSS3 with flexbox/grid
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Other:** UUID generation for unique codes, CORS support

## Project Structure

```
.
├── server.js                 # Express backend server
├── package.json              # Root dependencies
├── README.md                 # This file
├── urls.db                   # SQLite database (auto-created)
└── client/                   # React frontend
    ├── public/               # Static HTML
    ├── src/                  # React components & styles
    │   ├── App.js            # Main app component
    │   ├── App.css
    │   ├── components/       # Reusable components
    │   │   ├── URLForm.js    # Form to create short URLs
    │   │   ├── URLList.js    # Display all URLs
    │   │   └── URLCard.js    # Individual URL card
    │   └── index.js          # Entry point
    └── package.json          # Client dependencies
```

## API Endpoints

### POST `/api/shorten`
Create a new shortened URL.

**Request:**
```json
{
  "url": "https://example.com/very/long/url/path"
}
```

**Response:**
```json
{
  "id": 1,
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url/path",
  "shortUrl": "http://localhost:5000/s/abc123",
  "clicks": 0,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### GET `/api/urls`
Retrieve all shortened URLs.

**Response:**
```json
[
  {
    "id": 1,
    "shortCode": "abc123",
    "originalUrl": "https://example.com/url",
    "shortUrl": "http://localhost:5000/s/abc123",
    "clicks": 5,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### GET `/api/urls/:shortCode`
Get statistics for a specific URL.

### GET `/s/:shortCode`
Redirect to original URL (increments click count).

### DELETE `/api/urls/:shortCode`
Delete a shortened URL.

## Usage Guide

### Creating a Short URL
1. Open the application
2. Paste a long URL in the input field
3. Click "Shorten"
4. Your short URL appears with copy button

### Managing URLs
- **Copy:** Click the "Copy" button to copy the short URL to clipboard
- **Delete:** Click the red "✕" button to remove a URL
- **Sort:** Use the dropdown to sort by "Most Recent" or "Most Clicks"
- **Stats:** View click count and creation date on each card

### URL Tracking
- Click counts are automatically incremented when someone follows a short URL
- The "Clicks" stat shows total follows for that link

## Installation & Running

### Install Dependencies
```bash
npm install
cd client && npm install
```

### Development Mode
```bash
npm run dev
```
This starts both the backend server and React dev server concurrently.

### Production Build
```bash
npm run build
```

### Server Only
```bash
npm run server
```

### Client Only
```bash
cd client && npm start
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- Short codes are randomly generated (6 characters)
- Database is stored in `urls.db` in the project root
- URLs are persisted across server restarts
- The app uses SQLite for lightweight, file-based storage
- All URLs must be valid and include protocol (http/https)

## Future Enhancements

- Custom short codes
- URL expiration dates
- API authentication/tokens
- Analytics dashboard
- QR code generation
- URL preview/metadata

## License

MIT
