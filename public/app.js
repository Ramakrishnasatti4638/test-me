// Generate a simple session ID for this user
const sessionId = 'user_' + Math.random().toString(36).substring(7);

let cart = [];
let products = [];

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const overlay = document.getElementById('overlay');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const clearCartBtn = document.getElementById('clear-cart');

// Fetch products from API
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
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Add to cart
async function addToCart(productId) {
    try {
        const response = await fetch(`/api/cart/${sessionId}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        });
        cart = await response.json();
        updateCart();
        openCart();
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Update quantity
async function updateQuantity(productId, quantity) {
    try {
        const response = await fetch(`/api/cart/${sessionId}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity })
        });
        cart = await response.json();
        updateCart();
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Remove from cart
async function removeFromCart(productId) {
    try {
        const response = await fetch(`/api/cart/${sessionId}/remove/${productId}`, {
            method: 'DELETE'
        });
        cart = await response.json();
        updateCart();
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

// Clear cart
async function clearCart() {
    try {
        const response = await fetch(`/api/cart/${sessionId}`, {
            method: 'DELETE'
        });
        cart = await response.json();
        updateCart();
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

// Update cart UI
function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>🛒 Your cart is empty</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-button" onclick="updateQuantity(${item.productId}, ${item.quantity - 1})">−</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-button" onclick="updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-button" onclick="removeFromCart(${item.productId})">Remove</button>
                </div>
            </div>
        `).join('');
    }
}

// Open cart
function openCart() {
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
}

// Close cart
function closeCartSidebar() {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// Event listeners
cartToggle.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartSidebar);
overlay.addEventListener('click', closeCartSidebar);
clearCartBtn.addEventListener('click', clearCart);

// Load products on page load
loadProducts();
