export function searchProducts(products, query) {
  return products.filter((product) =>
    product.name.toLowerCase().includes(query)
  );
}