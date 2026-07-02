// Cart state
let cart = [];

// DOM elements
const productsGrid = document.getElementById('products-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const overlay = document.getElementById('overlay');

// Fetch and display products
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
    productsGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
  }
}

// Display products in grid
function displayProducts(products) {
  productsGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-price">$${product.price.toFixed(2)}</p>
      <button class="add-to-cart-btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
        Add to Cart
      </button>
    </div>
  `).join('');
}

// Add item to cart
function addToCart(id, name, price) {
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  
  updateCart();
  openCart();
}

// Update cart display
function updateCart() {
  updateCartCount();
  updateCartTotal();
  renderCartItems();
}

// Update cart count badge
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

// Update cart total
function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Render cart items
function renderCartItems() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    return;
  }
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="quantity-controls">
        <button class="qty-btn" onclick="decreaseQuantity(${item.id})">−</button>
        <span class="quantity">${item.quantity}</span>
        <button class="qty-btn" onclick="increaseQuantity(${item.id})">+</button>
      </div>
    </div>
  `).join('');
}

// Increase quantity
function increaseQuantity(id) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity++;
    updateCart();
  }
}

// Decrease quantity
function decreaseQuantity(id) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity--;
    if (item.quantity === 0) {
      cart = cart.filter(cartItem => cartItem.id !== id);
    }
    updateCart();
  }
}

// Open cart sidebar
function openCart() {
  cartSidebar.classList.add('open');
  overlay.classList.add('active');
}

// Close cart sidebar
function closeCartSidebar() {
  cartSidebar.classList.remove('open');
  overlay.classList.remove('active');
}

// Event listeners
cartToggle.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartSidebar);
overlay.addEventListener('click', closeCartSidebar);

// Initialize
loadProducts();
