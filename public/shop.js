// Cart state
let cart = {};

// DOM elements
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const cartToggle = document.getElementById('cart-toggle');
const closeCartBtn = document.getElementById('close-cart');

// Event listeners
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    const product = {
      id: card.dataset.id,
      name: card.dataset.name,
      price: parseFloat(card.dataset.price)
    };
    addToCart(product);
  });
});

cartToggle.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Cart functions
function addToCart(product) {
  if (cart[product.id]) {
    cart[product.id].quantity++;
  } else {
    cart[product.id] = { ...product, quantity: 1 };
  }
  updateCart();
  openCart();
}

function updateQuantity(productId, change) {
  if (cart[productId]) {
    cart[productId].quantity += change;
    if (cart[productId].quantity <= 0) {
      delete cart[productId];
    }
    updateCart();
  }
}

function updateCart() {
  const itemCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const total = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  cartCountEl.textContent = itemCount;
  cartTotalEl.textContent = `$${total.toFixed(2)}`;
  
  renderCartItems();
}

function renderCartItems() {
  if (Object.keys(cart).length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    return;
  }
  
  cartItemsContainer.innerHTML = Object.values(cart).map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="quantity-controls">
        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
        <span class="quantity">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
      </div>
    </div>
  `).join('');
}

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
}

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
}

// Initialize
updateCart();
