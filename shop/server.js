const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const products = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, image: '🎧' },
  { id: 2, name: 'Mechanical Keyboard', price: 129.50, image: '⌨️' },
  { id: 3, name: 'USB-C Hub',          price:  34.00, image: '🔌' },
  { id: 4, name: 'Ergonomic Mouse',    price:  45.75, image: '🖱️' },
  { id: 5, name: 'Webcam 1080p',       price:  59.99, image: '📷' },
  { id: 6, name: 'Desk Lamp',          price:  24.50, image: '💡' },
];

// In-memory cart: { [productId]: quantity }
let cart = {};

function calcTotal() {
  let total = 0;
  let count = 0;
  for (const id of Object.keys(cart)) {
    const product = products.find(p => p.id === Number(id));
    if (!product) continue;
    total += product.price * cart[id];
    count += cart[id];
  }
  return { total: Math.round(total * 100) / 100, count };
}

app.get('/api/products', (_req, res) => {
  res.json(products);
});

app.get('/api/cart', (_req, res) => {
  const items = Object.keys(cart).map(id => {
    const product = products.find(p => p.id === Number(id));
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: cart[id],
      subtotal: Math.round(product.price * cart[id] * 100) / 100,
    };
  });
  res.json({ items, ...calcTotal() });
});

app.post('/api/cart/add', (req, res) => {
  const { productId } = req.body || {};
  const product = products.find(p => p.id === Number(productId));
  if (!product) return res.status(400).json({ error: 'Invalid productId' });
  cart[product.id] = (cart[product.id] || 0) + 1;
  res.json({ items: cart, ...calcTotal() });
});

app.post('/api/cart/update', (req, res) => {
  const { productId, quantity } = req.body || {};
  const id = Number(productId);
  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }
  if (!products.find(p => p.id === id)) {
    return res.status(400).json({ error: 'Invalid productId' });
  }
  if (quantity === 0) {
    delete cart[id];
  } else {
    cart[id] = quantity;
  }
  res.json({ items: cart, ...calcTotal() });
});

app.post('/api/cart/clear', (_req, res) => {
  cart = {};
  res.json({ items: cart, ...calcTotal() });
});

app.listen(PORT, () => {
  console.log(`Shop server running on http://localhost:${PORT}`);
});
