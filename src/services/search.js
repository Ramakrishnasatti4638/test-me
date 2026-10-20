export function searchProducts(products, query) {
  const q = query.toLocaleLowerCase();
  return products.filter((product) =>
    product.name.toLocaleLowerCase().includes(q)
  );
}