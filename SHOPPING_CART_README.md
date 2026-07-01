# Shopping Cart Application

A full-stack shopping cart application with product listing and cart management features.

## Features

### Frontend
- **Product Listing**: Display 6 products in a responsive grid layout
- **Shopping Cart Sidebar**: Slides in from the right when items are added
- **Quantity Controls**: Increase (+) and decrease (−) buttons for each cart item
- **Running Total**: Real-time calculation of cart total
- **Responsive Design**: Works on desktop and mobile devices

### Backend API
- **GET /api/products**: Returns all 6 products
- **GET /api/products/:id**: Returns a single product by ID

## Technology Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **No build tools required**: Pure static files served by Express

## Project Structure

```
/home/user/test-me/
├── server.js           # Express server with product API
├── package.json        # Dependencies and scripts
└── public/            # Static frontend files
    ├── index.html     # Main HTML page
    ├── styles.css     # Styling and layout
    └── script.js      # Cart logic and API integration
```

## Installation & Usage

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser to:
```
http://localhost:3000
```

## API Endpoints

### GET /api/products
Returns all products.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Wireless Headphones",
    "price": 79.99
  },
  {
    "id": 2,
    "name": "Smart Watch",
    "price": 199.99
  },
  ...
]
```

### GET /api/products/:id
Returns a single product by ID.

**Example:** `/api/products/1`

**Response:**
```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "price": 79.99
}
```

**Error Response (404):**
```json
{
  "error": "Product not found"
}
```

## Features in Detail

### Product Cards
- Display product name, price, and "Add to Cart" button
- Hover effect with elevation animation
- Responsive grid layout (3 columns on desktop, adjusts for mobile)

### Cart Sidebar
- Slides in from right with smooth animation
- Shows all items in cart with quantity and price
- Quantity controls: + and − buttons
- Items automatically removed when quantity reaches 0
- Dark overlay behind sidebar
- Close button (×) and click outside to close

### Cart Functionality
- Cart count badge on header button
- Real-time total calculation
- Persistent state during session (in-memory)
- Add same product multiple times to increase quantity

## Styling
- Modern, clean design
- Color scheme: Dark header (#2c3e50), blue accents (#3498db)
- Smooth transitions and hover effects
- Mobile-responsive layout
- Professional card-based product grid

## Browser Compatibility
Works in all modern browsers that support:
- ES6 JavaScript (async/await, arrow functions)
- CSS Grid and Flexbox
- CSS transitions and transforms
