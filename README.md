# test-me-api

A small Node.js REST API built with Express 4 and ES modules.

## Requirements

- Node.js >= 20

## Install

```bash
npm install
```

## Run

```bash
# Production
npm start

# Auto-restart on file changes
npm run dev
```

The server listens on `PORT` (default `3000`).

## Test

```bash
npm test
```

## Endpoints

#### Health

| Method | Path     | Body | Response               |
|--------|----------|------|------------------------|
| GET    | /health  | —    | `200` `{ "status": "ok" }` |

#### Users

| Method | Path        | Body                            | Response                          |
|--------|-------------|---------------------------------|-----------------------------------|
| GET    | /users      | —                               | `200` array of users              |
| GET    | /users/:id  | —                               | `200` user · `404` if not found   |
| POST   | /users      | `{ "name": string, "email": string }` | `201` user · `400` on invalid body |

`POST /users` requires a non-empty `name` and a valid `email` address.

#### Todos

| Method | Path         | Body                                                              | Response                                  |
|--------|--------------|--------------------------------------------------------------------|-------------------------------------------|
| GET    | /todos       | —                                                                  | `200` array of todos                      |
| POST   | /todos       | `{ "title": string, "userId": int, "completed"?: boolean }`       | `201` todo · `400` on invalid body        |
| PATCH  | /todos/:id   | any subset of `{ title, completed, userId }`                      | `200` todo · `400` on invalid field · `404` if not found |

`POST /todos` requires a non-empty `title` and a `userId` referencing an existing user.
`PATCH /todos/:id` performs a partial update; unknown todo ids return `404`.

## Error shape

All error responses use:

```json
{ "error": "message" }
```