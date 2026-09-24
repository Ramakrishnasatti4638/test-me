# URL Shortener App 🔗

A full-stack URL shortener application built with Node.js, Express, and SQLite. Includes a beautiful UI and comprehensive test suite with redirect verification.

## Features

✅ **Shorten URLs** - Convert long URLs into short, shareable links  
✅ **Redirect on Click** - Click a short link and automatically redirect to the original URL  
✅ **Beautiful UI** - Modern, responsive interface with gradient design  
✅ **API Endpoints** - RESTful API for programmatic URL shortening  
✅ **Comprehensive Tests** - Full test suite including redirect verification  
✅ **Error Handling** - Input validation and graceful error messages  

## Project Structure

```
url-shortener/
├── server.js                 # Express server & API routes
├── public/
│   └── index.html           # Frontend UI
├── __tests__/
│   └── url-shortener.test.js # Test suite (11 tests)
├── package.json             # Dependencies
└── README.md               # This file
```

## API Endpoints

### POST /api/shorten
Create a short URL from a long URL.

**Request:**
```json
{
  "url": "https://www.example.com/very/long/url"
}
```

**Response:**
```json
{
  "shortCode": "abc12def",
  "shortUrl": "http://localhost:3000/abc12def",
  "originalUrl": "https://www.example.com/very/long/url"
}
```

### GET /api/urls/:shortCode
Retrieve URL data by short code.

**Response:**
```json
{
  "id": "abc12def",
  "originalUrl": "https://www.example.com/very/long/url",
  "shortCode": "abc12def",
  "createdAt": "2024-01-15 10:30:45"
}
```

### GET /:shortCode
**This is the key route** - Redirects from short link to original URL (HTTP 301).

**Behavior:**
- User clicks on `http://localhost:3000/abc12def`
- Server responds with HTTP 301 redirect
- Browser automatically navigates to original URL
- Location header contains the original URL

## Test Suite

The app includes **11 comprehensive tests** covering:

### Key Test: Redirect Verification ✨
```javascript
test('KEY TEST: When user clicks short link, it should redirect to original URL', async () => {
  const res = await request(app).get(`/${shortCode}`).redirects(0);
  expect(res.status).toBe(301);                    // Redirect response
  expect(res.headers.location).toBe(testUrl);      // Points to original URL
});
```

### All Tests:
1. ✓ Create short URL for valid input
2. ✓ Reject empty URL
3. ✓ Reject invalid URL format
4. ✓ Reject missing URL property
5. ✓ Retrieve URL data by short code
6. ✓ Return 404 for non-existent short code
7. ✓ **KEY TEST: Redirect to original URL when clicking short link**
8. ✓ Return 404 for invalid short code
9. ✓ Handle short codes with special characters
10. ✓ Complete full URL shortening and redirect flow
11. ✓ Handle multiple short URLs without collision

## Test Results

```
PASS __tests__/url-shortener.test.js
  URL Shortener API
    POST /api/shorten
      ✓ should create a short URL for valid input
      ✓ should reject empty URL
      ✓ should reject invalid URL format
      ✓ should reject missing URL property
    GET /api/urls/:shortCode
      ✓ should retrieve URL data by short code
      ✓ should return 404 for non-existent short code
    GET /:shortCode - Redirect Test (KEY TEST: Click Link → Redirect)
      ✓ KEY TEST: When user clicks short link, it should redirect to original URL
      ✓ should return 404 for invalid short code
      ✓ should properly handle short codes with special characters
    Integration - Full Flow
      ✓ should complete full URL shortening and redirect flow
      ✓ should handle multiple short URLs without collision

Test Suites: 1 passed, 1 total
Tests: 11 passed, 11 total
```

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** SQLite (in-memory)
- **Frontend:** HTML5, CSS3, JavaScript
- **Testing:** Jest, Supertest
- **URL Generation:** shortid

## How It Works

1. **User enters long URL** in the web form
2. **Frontend sends POST request** to `/api/shorten`
3. **Backend generates short code** (8 characters)
4. **URL mapping stored** in SQLite database
5. **Short URL returned** to user
6. **User clicks short link** → GET request to `/:shortCode`
7. **Server responds with 301 redirect** to original URL
8. **Browser navigates** to the original URL

## Visual Flow

```
User Input → Shorten Request → Generate Code → Store in DB
                                                      ↓
                                              Return Short URL
                                                      ↓
                                         User Clicks Short Link
                                                      ↓
                                         HTTP 301 Redirect Response
                                                      ↓
                                         Browser Navigates to Original
```

## Notes

- Short codes are unique (8-character alphanumeric strings)
- Uses in-memory SQLite for demo purposes (data persists during session)
- All redirects use HTTP 301 (Moved Permanently)
- Input validation ensures only valid URLs are shortened
- Comprehensive error handling with meaningful error messages
