const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ── Product data ────────────────────────────────────────
const products = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling over-ear headphones with 30h battery life.',
    price: 79.99,
    emoji: '🎧',
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    description: 'Compact TKL keyboard with RGB backlighting and tactile switches.',
    price: 109.99,
    emoji: '⌨️',
  },
  {
    id: '3',
    name: 'Desk Lamp',
    description: 'Adjustable LED desk lamp with USB-C charging port and touch control.',
    price: 34.99,
    emoji: '💡',
  },
  {
    id: '4',
    name: 'Laptop Stand',
    description: 'Foldable aluminium laptop stand, compatible with 10–17" devices.',
    price: 44.99,
    emoji: '💻',
  },
  {
    id: '5',
    name: 'Webcam HD',
    description: '1080p 60fps webcam with built-in microphone and auto-focus.',
    price: 59.99,
    emoji: '📷',
  },
  {
    id: '6',
    name: 'USB-C Hub',
    description: '7-in-1 hub: HDMI 4K, 3× USB-A, SD card, PD charging.',
    price: 49.99,
    emoji: '🔌',
  },
];

// ── Routes ──────────────────────────────────────────────

// GET /api/products  → return all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id  → return single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ── Start ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`ShopVibe API running → http://localhost:${PORT}`);
});
