export function searchProducts(products, query) {
  const q = query.toLowerCase();
  return products.filter((product) =>
    product.name.toLowerCase().includes(q)
  );
}