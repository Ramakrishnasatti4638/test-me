export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  lastUpdated: string;
}

const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/api/products`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }
  const data = (await res.json()) as { products: Product[] };
  return data.products;
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (res.status === 404) {
    throw new Error('Product not found');
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status}`);
  }
  return (await res.json()) as Product;
}