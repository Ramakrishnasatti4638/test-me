# QuickLink — Modern URL Shortener

A high-performance URL shortener application built with Node.js, Express, and SQLite (WAL mode).

## Features
- **Fast URL Shortening**: Generates collision-resistant short identifiers or accepts custom aliases.
- **Analytics & Click Tracking**: Tracks total visits, timestamps, referrers, and user agents.
- **QR Code Generation**: Automatically creates high-resolution QR codes for every shortened link.
- **Modern Responsive UI**: Dark mode UI with real-time stats overview, one-click copy, and click log inspection.
- **Automated Tests**: Comprehensive test suite using Node.js native test runner.

## API Endpoints
- `POST /api/shorten` — Shorten a destination URL with optional title and custom alias.
- `GET /api/urls` — Fetch recent shortened URLs and aggregate statistics.
- `GET /api/stats/:code` — Retrieve click counts, metadata, and detailed access logs for a specific short link.
- `GET /api/qr/:code` — Generate and stream QR code image (PNG).
- `DELETE /api/urls/:code` — Delete a shortened URL and its associated click records.
- `GET /:code` — Redirect visitors to original destination and record analytics.
