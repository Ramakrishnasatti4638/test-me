const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// Mock product data
const products = [
  { id: 1, name: 'Wireless Headphones', price: 79.99 },
  { id: 2, name: 'Smart Watch', price: 199.99 },
  { id: 3, name: 'Laptop Stand', price: 49.99 },
  { id: 4, name: 'USB-C Hub', price: 39.99 },
  { id: 5, name: 'Mechanical Keyboard', price: 129.99 },
  { id: 6, name: 'Wireless Mouse', price: 59.99 }
];

// In-memory cart storage (per session - simplified)
let carts = {};

// API: Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// API: Get product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// API: Get cart
app.get('/api/cart/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  const cart = carts[sessionId] || [];
  res.json(cart);
});

// API: Add item to cart
app.post('/api/cart/:sessionId/add', (req, res) => {
  const sessionId = req.params.sessionId;
  const { productId, quantity = 1 } = req.body;
  
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  if (!carts[sessionId]) {
    carts[sessionId] = [];
  }
  
  const existingItem = carts[sessionId].find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    carts[sessionId].push({
      productId,
      name: product.name,
      price: product.price,
      quantity
    });
  }
  
  res.json(carts[sessionId]);
});

// API: Update item quantity
app.put('/api/cart/:sessionId/update', (req, res) => {
  const sessionId = req.params.sessionId;
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

// API: Remove item from cart
app.delete('/api/cart/:sessionId/remove/:productId', (req, res) => {
  const sessionId = req.params.sessionId;
  const productId = parseInt(req.params.productId);
  
  if (!carts[sessionId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  carts[sessionId] = carts[sessionId].filter(item => item.productId !== productId);
  res.json(carts[sessionId]);
});

// API: Clear cart
app.delete('/api/cart/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  carts[sessionId] = [];
  res.json({ message: 'Cart cleared' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
