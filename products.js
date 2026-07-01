const API_URL = 'http://localhost:3000/api';

let cart = [];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');

// Fetch and display products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = '<p style="color: white; text-align: center;">Error loading products. Make sure the API server is running.</p>';
    }
}

// Display products in the grid
function displayProducts(products) {
    productGrid.innerHTML = products.map(product => `
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
    updateCartItems();
    updateCartTotal();
}

// Update cart count badge
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Update cart items display
function updateCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">−</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
            </div>
        </div>
    `).join('');
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
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
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
}

// Close cart sidebar
function closeCartSidebar() {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// Event listeners
cartToggle.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartSidebar);
overlay.addEventListener('click', closeCartSidebar);

// Initialize
loadProducts();
