import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProduct, type Product } from '../api';

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setProduct(null);

    if (id === undefined) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const numericId = Number(id);
    fetchProduct(numericId)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.message === 'Product not found') {
          setNotFound(true);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (notFound || product === null) return <p>Product not found</p>;

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  return (
    <article>
      <h1>{product.name}</h1>
      <p>{formatted}</p>
      <p>{product.description}</p>
      <p>Updated {product.lastUpdated}</p>
    </article>
  );
}