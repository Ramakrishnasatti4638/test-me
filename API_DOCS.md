# Product Store API Documentation

## Overview
This is a RESTful API for managing products and shopping cart functionality.

## Base URL
```
http://localhost:3000
```

## API Endpoints

### Products

#### Get All Products
```
GET /api/products
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Wireless Headphones",
    "price": 79.99
  },
  ...
]
```

#### Get Product by ID
```
GET /api/products/:id
```

**Parameters:**
- `id` (path parameter) - Product ID

**Response:**
```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "price": 79.99
}
```

**Error Response:**
```json
{
  "error": "Product not found"
}
```

### Cart

#### Get Cart
```
GET /api/cart/:sessionId
```

**Parameters:**
- `sessionId` (path parameter) - Session identifier

**Response:**
```json
[
  {
    "productId": 1,
    "name": "Wireless Headphones",
    "price": 79.99,
    "quantity": 2
  },
  ...
]
```

#### Add Item to Cart
```
POST /api/cart/:sessionId/add
```

**Parameters:**
- `sessionId` (path parameter) - Session identifier

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 1
}
```

**Response:**
```json
[
  {
    "productId": 1,
    "name": "Wireless Headphones",
    "price": 79.99,
    "quantity": 1
  }
]
```

#### Update Item Quantity
```
PUT /api/cart/:sessionId/update
```

**Parameters:**
- `sessionId` (path parameter) - Session identifier

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 3
}
```

**Note:** Setting quantity to 0 or negative will remove the item from cart.

**Response:**
```json
[
  {
    "productId": 1,
    "name": "Wireless Headphones",
    "price": 79.99,
    "quantity": 3
  }
]
```

#### Remove Item from Cart
```
DELETE /api/cart/:sessionId/remove/:productId
```

**Parameters:**
- `sessionId` (path parameter) - Session identifier
- `productId` (path parameter) - Product ID to remove

**Response:**
```json
[
  // Remaining cart items
]
```

#### Clear Cart
```
DELETE /api/cart/:sessionId
```

**Parameters:**
- `sessionId` (path parameter) - Session identifier

**Response:**
```json
{
  "message": "Cart cleared"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `404` - Resource not found
- `500` - Server error

Error response format:
```json
{
  "error": "Error message"
}
```

## Running the Server

```bash
npm install
npm start
```

Server will start on http://localhost:3000

## Frontend

The frontend is a vanilla HTML/CSS/JS application served from the `/public` directory. Simply navigate to http://localhost:3000 in your browser to access the product store.

### Features
- Product listing with 6 products
- Add to cart functionality
- Sliding cart sidebar
- Quantity controls (+/− buttons)
- Running total calculation
- Clear cart functionality
- Responsive design
