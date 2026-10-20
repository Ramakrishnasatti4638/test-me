import { Router } from 'express';
import { searchProducts } from '../services/search.js';
import { products } from '../data/products.js';

const router = Router();

router.get('/api/products/search', (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }
  const results = searchProducts(products, q);
  res.json({ results });
});

export default router;