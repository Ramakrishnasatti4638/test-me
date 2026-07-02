const API_URL = 'http://localhost:3000/api/products';

let cart = [];
let products = [];

// DOM Elements
const productsContainer = document.getElementById('products-container');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const overlay = document.getElementById('overlay');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        products = await response.json();
        displayProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        productsContainer.innerHTML = '<p style="color: white; text-align: center;">Error loading products. Please try again.</p>';
    }
}

// Display products
function displayProducts() {
    productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <span class="price">$${product.price.toFixed(2)}</span>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
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
            ...product,
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

// Display cart items
function displayCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <h4>${item.name}</h4>
            <div class="cart-item-details">
                <span class="price">$${item.price.toFixed(2)}</span>
                <div class="quantity-controls">
                    <button onclick="decreaseQuantity(${item.id})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseQuantity(${item.id})">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Increase quantity
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity++;
        updateCart();
    }
}

// Decrease quantity
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity--;
        if (item.quantity === 0) {
            cart = cart.filter(cartItem => cartItem.id !== productId);
        }
        updateCart();
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

// Initialize
fetchProducts();
