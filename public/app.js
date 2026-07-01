// Generate a simple session ID for cart management
const SESSION_ID = 'user_' + Math.random().toString(36).substr(2, 9);

// State
let cart = [];
let products = [];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const clearCartBtn = document.getElementById('clearCart');
const overlay = document.getElementById('overlay');

// Initialize app
async function init() {
    await loadProducts();
    await loadCart();
    setupEventListeners();
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Render products
function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Load cart from API
async function loadCart() {
    try {
        const response = await fetch(`/api/cart/${SESSION_ID}`);
        cart = await response.json();
        updateCartUI();
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Add item to cart
async function addToCart(productId) {
    try {
        const response = await fetch(`/api/cart/${SESSION_ID}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        
        cart = await response.json();
        updateCartUI();
        openCart();
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Update item quantity
async function updateQuantity(productId, newQuantity) {
    try {
        const response = await fetch(`/api/cart/${SESSION_ID}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: newQuantity })
        });
        
        cart = await response.json();
        updateCartUI();
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Clear cart
async function clearCart() {
    try {
        await fetch(`/api/cart/${SESSION_ID}`, {
            method: 'DELETE'
        });
        
        cart = [];
        updateCartUI();
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Render cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.productId}, ${item.quantity - 1})">−</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Open cart
function openCart() {
    cartSidebar.classList.add('open');
    overlay.classList.add('active');
}

// Close cart
function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    overlay.classList.remove('active');
}

// Setup event listeners
function setupEventListeners() {
    cartToggle.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartSidebar);
    overlay.addEventListener('click', closeCartSidebar);
    clearCartBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            await clearCart();
        }
    });
}

// Initialize on page load
init();
