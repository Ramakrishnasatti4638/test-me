# URL Shortener App

A modern, full-stack URL shortener application built with Node.js/Express and React.

## Features

- ✨ **Shorten URLs** - Convert long URLs into short, shareable links
- 📋 **Copy to Clipboard** - One-click copy functionality for shortened URLs
- 🎨 **Modern UI** - Clean, responsive design with gradient styling
- ⚡ **Fast** - Instant URL shortening with in-memory storage
- 🔄 **RESTful API** - Simple API endpoints for URL management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React 18, Vite
- **URL ID Generation**: nanoid
- **Styling**: CSS3 with gradients and responsive design

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
  "shortId": "abc12345",
  "shortUrl": "http://localhost:5000/abc12345",
  "originalUrl": "https://example.com/very/long/path"
}
```

### GET /:shortId
Redirect to the original URL.

### GET /api/stats/:shortId
Get statistics for a shortened URL.

## Project Structure

```
.
├── server.js          # Express backend
├── package.json       # Root dependencies
├── client/            # React frontend
│   ├── src/
│   │   ├── App.jsx   # Main React component
│   │   ├── App.css   # App styles
│   │   ├── index.css # Global styles
│   │   └── main.jsx  # React entry point
│   ├── index.html    # HTML template
│   ├── package.json  # Frontend dependencies
│   └── vite.config.js # Vite configuration
└── README.md
```

## Installation & Usage

1. Install root dependencies:
```bash
npm install
```

2. Install client dependencies:
```bash
npm install --prefix client
```

3. Start both backend and frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:3000` (frontend) with the backend running on `http://localhost:5000`.

## Usage

1. Open the application in your browser
2. Paste a long URL into the input field
3. Click "Shorten" button
4. Copy the shortened URL using the copy button
5. Share the short link

## Notes

- URLs are stored in-memory, so they will be lost on server restart
- The short ID is generated using nanoid (8 characters)
- CORS is enabled for cross-origin requests
- All URLs are validated before shortening
