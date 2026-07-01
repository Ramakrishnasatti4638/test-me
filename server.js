const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// API endpoint to get products
app.get('/api/products', (req, res) => {
  const products = [
    { id: 1, name: 'Wireless Headphones', price: 79.99 },
    { id: 2, name: 'Smart Watch', price: 199.99 },
    { id: 3, name: 'Laptop Stand', price: 49.99 },
    { id: 4, name: 'USB-C Hub', price: 39.99 },
    { id: 5, name: 'Mechanical Keyboard', price: 129.99 },
    { id: 6, name: 'Wireless Mouse', price: 59.99 }
  ];
  res.json(products);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
