const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

const products = [
  { id: 1, name: 'Wireless Headphones', price: 79.99 },
  { id: 2, name: 'Smart Watch', price: 199.99 },
  { id: 3, name: 'Laptop Stand', price: 49.99 },
  { id: 4, name: 'Mechanical Keyboard', price: 129.99 },
  { id: 5, name: 'USB-C Hub', price: 39.99 },
  { id: 6, name: 'Portable SSD', price: 89.99 }
];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
