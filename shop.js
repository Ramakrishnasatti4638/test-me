const API_URL = 'http://localhost:3001/api';

let cart = [];

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('products-container').innerHTML = 
      '<p style="color: white; text-align: center;">Error loading products. Please make sure the server is running.</p>';
  }
}

function displayProducts(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = products.map(product => `
    <div class="product-card">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-price">$${product.price.toFixed(2)}</p>
      <button class="add-to-cart-btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
        Add to Cart
      </button>
    </div>
  `).join('');
}

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

function updateCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartTotal.textContent = '$0.00';
    return;
  }
  
  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="quantity-controls">
        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
        <span class="quantity">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;
}

function updateQuantity(id, delta) {
  const item = cart.find(item => item.id === id);
  
  if (item) {
    item.quantity += delta;
    
    if (item.quantity <= 0) {
      cart = cart.filter(item => item.id !== id);
    }
    
    updateCart();
  }
}

function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('visible');
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('visible');
}

document.getElementById('cart-toggle').addEventListener('click', openCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
document.getElementById('cart-overlay').addEventListener('click', closeCart);

loadProducts();
