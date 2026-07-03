# ShopVibe API

Express server that powers the ShopVibe product listing page.

## Setup

```bash
cd api_db
npm install
npm start
```

Server starts on **http://localhost:4000**

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List all 6 products |
| GET | `/api/products/:id` | Get a single product |
| GET | `/health` | Health check |
