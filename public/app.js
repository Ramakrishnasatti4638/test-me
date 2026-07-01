// Generate a simple session ID
const SESSION_ID = 'user_' + Math.random().toString(36).substr(2, 9);

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const checkoutBtn = document.getElementById('checkoutBtn');

let products = [];
let cart = [];

// Fetch products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products
function displayProducts() {
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <span class="price">$${product.price.toFixed(2)}</span>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
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
        
        const data = await response.json();
        if (data.success) {
            cart = data.cart;
            updateCart();
            openCart();
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Update cart item quantity
async function updateQuantity(productId, newQuantity) {
    try {
        const response = await fetch(`/api/cart/${SESSION_ID}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: newQuantity })
        });
        
        const data = await response.json();
        if (data.success) {
            cart = data.cart;
            updateCart();
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Update cart display
function updateCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartCount.textContent = '0';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    // Calculate total items
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Calculate total price
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Display cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn minus" onclick="updateQuantity(${item.productId}, ${item.quantity - 1})">−</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn plus" onclick="updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
            </div>
        </div>
    `).join('');
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

// Event Listeners
cartToggle.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartSidebar);
overlay.addEventListener('click', closeCartSidebar);

checkoutBtn.addEventListener('click', () => {
    if (cart.length > 0) {
        alert('Checkout functionality would be implemented here!');
    }
});

// Load products on page load
loadProducts();
