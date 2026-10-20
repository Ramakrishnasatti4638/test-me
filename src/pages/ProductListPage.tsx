import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, type Product } from '../api';

export function ProductListPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p role="alert">Error: {error}</p>;
  if (products === null) return <p>Loading…</p>;

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
          {' — $'}
          {product.price.toFixed(2)}
        </li>
      ))}
    </ul>
  );
}