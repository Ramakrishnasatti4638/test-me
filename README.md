# Login Backend

A small, secure Express backend that powers a login page: register, login,
logout, and an authenticated `GET /api/auth/me`.

- **Stack:** Node 18+, Express 4, JWT, bcrypt, helmet, CORS, express-rate-limit, express-validator
- **Storage:** pluggable user model (in-memory by default, JSON file via `USER_STORE=file`)

## Quick start

```bash
cp .env.example .env       # set JWT_SECRET to a long random string
npm install
npm run dev                # node --watch on src/server.js
```

Server listens on `http://localhost:3000`.

## API

All responses use `{ "error": { "code", "message", "details?" } }` on failure.
On success the relevant payload is returned directly.

### `POST /api/auth/register`

```json
{ "email": "ada@example.com", "password": "secret-pw-12", "name": "Ada" }
```

Returns `201`:

```json
{
  "user":       { "id": "...", "email": "...", "name": "Ada", "createdAt": "..." },
  "accessToken":  "...",
  "refreshToken": "..."
}
```

Also sets `access_token` and `refresh_token` HTTP-only cookies.

### `POST /api/auth/login`

```json
{ "email": "ada@example.com", "password": "secret-pw-12" }
```

Returns `200` with the same payload. Invalid credentials return `401` with a
generic `Invalid email or password.` (no user enumeration).

### `POST /api/auth/logout`

Clears the auth cookies. Returns `{ "ok": true }`.

### `GET /api/auth/me`

Requires `Authorization: Bearer <accessToken>` (or the `access_token` cookie).
Returns `{ "user": { ... } }`.

## Project layout

```
src/
  app.js              # Express wiring (helmet, cors, cookies, routes)
  server.js           # HTTP listener + graceful shutdown
  config/             # Env-driven config
  routes/             # HTTP routing
  controllers/        # Request/response shaping
  services/           # Business logic
  models/             # Data access (user store)
  middleware/         # Auth, validation, error handling
  validators/         # express-validator chains
  utils/              # AppError, asyncHandler, jwt helpers
```

## Security notes

- Passwords hashed with **bcrypt** (configurable cost, default 12).
- Short-lived **JWT** access tokens (15m) + longer-lived refresh tokens (7d) — rotate via a `/refresh` endpoint when you add one.
- **helmet** for security headers, **CORS** locked to `CLIENT_ORIGIN`, credentials-on.
- **rate-limit** on every auth endpoint (20 req / 15 min / IP — tune via env).
- `bcrypt.compare` runs in constant time; identical error message for unknown
  email vs. wrong password prevents user enumeration.
- Never log secrets or passwords; `morgan` is enabled outside `test`.

## Swap the storage

Replace `src/models/user.model.js` with the same interface
(`findByEmail`, `findById`, `create`, `verifyPassword`, `sanitize`) backed by
Postgres / Mongo / SQLite / etc. Nothing else needs to change.
