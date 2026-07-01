const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// In-memory store for cart items (per session simulation)
const carts = {};

// Product catalog
const products = [
  { id: 1, name: 'Wireless Headphones', price: 79.99 },
  { id: 2, name: 'Smart Watch', price: 199.99 },
  { id: 3, name: 'Laptop Stand', price: 49.99 },
  { id: 4, name: 'USB-C Hub', price: 34.99 },
  { id: 5, name: 'Mechanical Keyboard', price: 129.99 },
  { id: 6, name: 'Wireless Mouse', price: 59.99 }
];

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get cart
app.get('/api/cart/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const cart = carts[sessionId] || [];
  res.json(cart);
});

// Add item to cart
app.post('/api/cart/:sessionId/add', (req, res) => {
  const { sessionId } = req.params;
  const { productId } = req.body;

  if (!carts[sessionId]) {
    carts[sessionId] = [];
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existingItem = carts[sessionId].find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    carts[sessionId].push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  res.json(carts[sessionId]);
});

// Update item quantity
app.put('/api/cart/:sessionId/update', (req, res) => {
  const { sessionId } = req.params;
  const { productId, quantity } = req.body;

  if (!carts[sessionId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const item = carts[sessionId].find(item => item.productId === productId);
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  if (quantity <= 0) {
    carts[sessionId] = carts[sessionId].filter(item => item.productId !== productId);
  } else {
    item.quantity = quantity;
  }

  res.json(carts[sessionId]);
});

// Remove item from cart
app.delete('/api/cart/:sessionId/remove/:productId', (req, res) => {
  const { sessionId, productId } = req.params;

  if (!carts[sessionId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  carts[sessionId] = carts[sessionId].filter(item => item.productId !== parseInt(productId));
  res.json(carts[sessionId]);
});

// Clear cart
app.delete('/api/cart/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  carts[sessionId] = [];
  res.json(carts[sessionId]);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
