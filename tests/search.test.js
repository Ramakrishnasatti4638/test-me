import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchProducts } from '../src/services/search.js';
import { products } from '../src/data/products.js';

test('searchProducts returns 3 products for "laptop"', () => {
  const results = searchProducts(products, 'laptop');
  assert.equal(results.length, 3);
});

test('searchProducts returns 3 products for "Laptop" (case-insensitive)', () => {
  const results = searchProducts(products, 'Laptop');
  assert.equal(results.length, 3);
});

test('searchProducts returns 1 product for "mouse"', () => {
  const results = searchProducts(products, 'mouse');
  assert.equal(results.length, 1);
});

test('searchProducts returns 0 products for "tablet"', () => {
  const results = searchProducts(products, 'tablet');
  assert.equal(results.length, 0);
});