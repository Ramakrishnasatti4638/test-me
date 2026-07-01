// Cart state
let cart = [];

// DOM elements
const productsGrid = document.getElementById('products-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotalAmount = document.getElementById('cart-total-amount');
const cartCount = document.getElementById('cart-count');

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
      <div class="product-price">$${product.price.toFixed(2)}</div>
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
  updateCartItems();
  updateCartTotal();
}

// Update cart count badge
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

// Update cart items list
function updateCartItems() {
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <p>Your cart is empty</p>
      </div>
    `;
    return;
  }
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-header">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">−</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
        </div>
        <span style="font-weight: bold; color: #667eea;">$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

// Update cart total
function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotalAmount.textContent = `$${total.toFixed(2)}`;
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
  cartOverlay.classList.add('active');
}

// Close cart sidebar
function closeCartSidebar() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
}

// Event listeners
cartToggle.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

// Initialize app
loadProducts();
