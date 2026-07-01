const API_URL = 'http://localhost:3000';

let cart = [];
let products = [];

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        products = await response.json();
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p style="text-align: center; color: #e74c3c;">Failed to load products. Please make sure the server is running.</p>';
    }
}

// Display products on the page
function displayProducts() {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-icon">${product.image}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCart();
    openCart();
}

// Update cart display
function updateCart() {
    updateCartCount();
    updateCartTotal();
    displayCartItems();
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

// Display cart items
function displayCartItems() {
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
            <div class="cart-item-icon">${item.image}</div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">−</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
            </div>
        </div>
    `).join('');
}

// Increase item quantity
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity++;
        updateCart();
    }
}

// Decrease item quantity
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity--;
        if (item.quantity === 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        updateCart();
    }
}

// Open cart sidebar
function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('visible');
}

// Close cart sidebar
function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('visible');
}

// Event listeners
cartToggle.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

// Initialize
loadProducts();
