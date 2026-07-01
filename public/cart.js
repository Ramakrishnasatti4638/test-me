// Cart state
let cart = [];

// DOM elements
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

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

// Update cart count
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
function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="decreaseQuantity('${item.id}')">−</button>
          <span class="quantity-display">${item.quantity}</span>
          <button class="quantity-btn" onclick="increaseQuantity('${item.id}')">+</button>
        </div>
      </div>
    `).join('');
  }
  updateCartCount();
  updateCartTotal();
}

// Add item to cart
function addToCart(id, name, price) {
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id,
      name,
      price,
      quantity: 1
    });
  }
  
  renderCart();
  openCart();
}

// Increase quantity
function increaseQuantity(id) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity++;
    renderCart();
  }
}

// Decrease quantity
function decreaseQuantity(id) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity--;
    if (item.quantity <= 0) {
      cart = cart.filter(cartItem => cartItem.id !== id);
    }
    renderCart();
  }
}

// Event listeners
cartToggle.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

addToCartButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const productCard = e.target.closest('.product-card');
    const id = productCard.dataset.id;
    const name = productCard.dataset.name;
    const price = parseFloat(productCard.dataset.price);
    
    addToCart(id, name, price);
  });
});

// Initial render
renderCart();
