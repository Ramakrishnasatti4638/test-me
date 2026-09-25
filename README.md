# URL Shortener App

A modern, full-stack URL shortener application built with **Node.js/Express** and **React**.

## Features

✨ **Core Functionality**
- Create shortened URLs with unique 7-character codes
- Redirect from short URLs to original targets
- Track click statistics for each shortened URL
- View all shortened URLs with metadata
- Delete shortened URLs
- Copy short URLs to clipboard with one click

🎨 **User Experience**
- Clean, modern gradient UI with smooth animations
- Responsive design (mobile-friendly)
- Real-time URL list updates
- Input validation and error handling
- Visual feedback for actions (copy confirmation, loading states)

## Tech Stack

**Backend:**
- Node.js & Express.js
- SQLite3 (persistent database)
- nanoid (unique ID generation)
- CORS (cross-origin support)

**Frontend:**
- React 18
- Axios (HTTP client)
- CSS3 (animations, gradients, flexbox)

## Project Structure

```
.
├── server.js                 # Express backend
├── package.json              # Root dependencies
├── client/
│   ├── package.json          # React app dependencies
│   ├── public/
│   │   └── index.html        # HTML entry point
│   └── src/
│       ├── App.js            # Main React component
│       ├── App.css           # Styled components
│       ├── index.js          # React entry point
│       └── index.css         # Global styles
└── urls.db                   # SQLite database (auto-created)
```

## API Endpoints

### POST `/api/shorten`
Create a new shortened URL.

**Request:**
```json
{
  "url": "https://example.com/very/long/path"
}
```

**Response:**
```json
{
  "originalUrl": "https://example.com/very/long/path",
  "shortCode": "abc1234",
  "shortUrl": "http://localhost:5000/s/abc1234"
}
```

### GET `/s/:shortCode`
Redirect to the original URL and increment click count.

### GET `/api/urls`
Retrieve all shortened URLs with statistics.

**Response:**
```json
[
  {
    "shortCode": "abc1234",
    "originalUrl": "https://example.com/very/long/path",
    "createdAt": "2024-01-15T10:30:00Z",
    "clicks": 5
  }
]
```

### GET `/api/stats/:shortCode`
Get statistics for a specific shortened URL.

**Response:**
```json
{
  "shortCode": "abc1234",
  "originalUrl": "https://example.com/very/long/path",
  "createdAt": "2024-01-15T10:30:00Z",
  "clicks": 5
}
```

### DELETE `/api/urls/:shortCode`
Delete a shortened URL.

## Database Schema

```sql
CREATE TABLE urls (
  id TEXT PRIMARY KEY,
  originalUrl TEXT NOT NULL,
  shortCode TEXT UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  clicks INTEGER DEFAULT 0
)
```

## Installation & Usage

The dependencies have been installed. To run the application:

1. **Start the backend server** (runs on port 5000):
   ```
   npm start
   ```

2. **In another terminal, start the React dev server** (runs on port 3000):
   ```
   cd client && npm start
   ```

Or run both concurrently:
```
npm run dev
```

3. **Build for production**:
   ```
   npm run build
   ```

## How It Works

1. **User enters a long URL** in the input field
2. **Backend validates** the URL format
3. **Generates a unique 7-character shortCode** using nanoid
4. **Stores the mapping** in SQLite database
5. **Returns the shortened URL** to the frontend
6. **User can copy** the short URL to clipboard
7. **When someone visits** the short URL, they're redirected to the original
8. **Click count increments** automatically

## Features in Detail

### URL Validation
- Ensures URLs are properly formatted using the URL constructor
- Returns helpful error messages for invalid URLs

### Click Tracking
- Automatically increments click counter when a short URL is visited
- Updates happen before redirect for accuracy

### Persistent Storage
- SQLite database persists across server restarts
- All data is stored in `urls.db` file

### Responsive Design
- Adapts to mobile screens
- Touch-friendly buttons and inputs
- Flexible layout that works on all device sizes

## Error Handling

The app handles various error scenarios:
- Invalid URL format → displays error message
- Database failures → returns 500 status
- Short code not found → returns 404 status
- Missing required fields → returns 400 status

## Future Enhancements

Possible additions:
- User authentication and personal URL libraries
- Custom short codes
- QR code generation
- Analytics dashboard
- URL expiration/TTL
- Rate limiting
- API key authentication
