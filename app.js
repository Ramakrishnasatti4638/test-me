// Product listing + sliding cart sidebar (vanilla JS)
const API_BASE = 'http://localhost:3001';

const els = {
  productGrid: document.getElementById('product-grid'),
  cartToggle: document.getElementById('cart-toggle'),
  cartClose: document.getElementById('cart-close'),
  cartSidebar: document.getElementById('cart-sidebar'),
  cartBackdrop: document.getElementById('cart-backdrop'),
  cartItems: document.getElementById('cart-items'),
  cartCount: document.getElementById('cart-count'),
  cartTotal: document.getElementById('cart-total'),
  checkoutBtn: document.getElementById('checkout-btn')
};

let cart = { items: [], total: 0, itemCount: 0 };

// ----- API helpers -----
async function fetchProducts() {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

async function fetchCart() {
  const res = await fetch(`${API_BASE}/api/cart`);
  if (!res.ok) throw new Error('Failed to load cart');
  return res.json();
}

async function addToCart(productId, quantity = 1) {
  const res = await fetch(`${API_BASE}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity })
  });
  if (!res.ok) throw new Error('Failed to add to cart');
  return res.json();
}

async function updateCartQuantity(productId, quantity) {
  const res = await fetch(`${API_BASE}/api/cart/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity })
  });
  if (!res.ok) throw new Error('Failed to update cart');
  return res.json();
}

async function removeFromCart(productId) {
  const res = await fetch(`${API_BASE}/api/cart/${productId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove from cart');
  return res.json();
}

// ----- Rendering -----
function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

function renderProducts(products) {
  els.productGrid.innerHTML = products.map((p) => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-image" aria-hidden="true">${p.image || '📦'}</div>
      <h3 class="product-name">${p.name}</h3>
      <p class="product-description">${p.description || ''}</p>
      <div class="product-price">${formatPrice(p.price)}</div>
      <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
    </article>
  `).join('');

  els.productGrid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      btn.disabled = true;
      const original = btn.textContent;
      btn.textContent = 'Adding…';
      try {
        cart = await addToCart(id, 1);
        renderCart();
        openCart();
        btn.textContent = '✓ Added';
        btn.classList.add('added');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('added');
          btn.disabled = false;
        }, 900);
      } catch (err) {
        console.error(err);
        btn.textContent = original;
        btn.disabled = false;
      }
    });
  });
}

function renderCart() {
  els.cartCount.textContent = cart.itemCount;
  els.cartTotal.textContent = formatPrice(cart.total);
  els.checkoutBtn.disabled = cart.items.length === 0;

  if (cart.items.length === 0) {
    els.cartItems.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    return;
  }

  els.cartItems.innerHTML = cart.items.map((item) => `
    <div class="cart-item" data-id="${item.product_id}">
      <div class="cart-item-image" aria-hidden="true">${imageFor(item.name)}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)} each</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn qty-decrement" aria-label="Decrease quantity" ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn qty-increment" aria-label="Increase quantity">+</button>
      </div>
      <button class="cart-remove" aria-label="Remove ${item.name}">×</button>
    </div>
  `).join('');

  els.cartItems.querySelectorAll('.cart-item').forEach((row) => {
    const id = Number(row.dataset.id);
    row.querySelector('.qty-decrement').addEventListener('click', () => {
      const item = cart.items.find((i) => i.product_id === id);
      if (!item || item.quantity <= 1) return;
      updateCartQuantity(id, item.quantity - 1).then((c) => { cart = c; renderCart(); });
    });
    row.querySelector('.qty-increment').addEventListener('click', () => {
      const item = cart.items.find((i) => i.product_id === id);
      if (!item) return;
      updateCartQuantity(id, item.quantity + 1).then((c) => { cart = c; renderCart(); });
    });
    row.querySelector('.cart-remove').addEventListener('click', () => {
      removeFromCart(id).then((c) => { cart = c; renderCart(); });
    });
  });
}

// Fallback emoji for products in the cart (we don't store the image in cart lines)
function imageFor(name) {
  const map = {
    'Wireless Headphones': '🎧',
    'Mechanical Keyboard': '⌨️',
    'Smart Coffee Mug': '☕',
    'Ergonomic Mouse': '🖱️',
    'Portable SSD 1TB': '💾',
    'HD Webcam': '📷'
  };
  return map[name] || '📦';
}

// ----- Sidebar open/close -----
function openCart() {
  els.cartSidebar.classList.add('open');
  els.cartBackdrop.hidden = false;
  // force reflow so the backdrop transition runs
  void els.cartBackdrop.offsetWidth;
  els.cartBackdrop.classList.add('open');
  els.cartSidebar.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  els.cartSidebar.classList.remove('open');
  els.cartBackdrop.classList.remove('open');
  els.cartSidebar.setAttribute('aria-hidden', 'true');
  setTimeout(() => { els.cartBackdrop.hidden = true; }, 300);
}

els.cartToggle.addEventListener('click', openCart);
els.cartClose.addEventListener('click', closeCart);
els.cartBackdrop.addEventListener('click', closeCart);
els.checkoutBtn.addEventListener('click', () => {
  if (cart.items.length === 0) return;
  alert(`Checkout — total ${formatPrice(cart.total)} (demo)`);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCart();
});

// ----- Boot -----
(async function init() {
  try {
    const [products, initialCart] = await Promise.all([fetchProducts(), fetchCart()]);
    renderProducts(products);
    cart = initialCart;
    renderCart();
  } catch (err) {
    console.error('Init failed:', err);
    els.productGrid.innerHTML = `
      <p style="grid-column: 1/-1; text-align:center; color:#ef4444; padding:40px 0;">
        Could not reach the API at ${API_BASE}. Make sure the backend is running.
      </p>`;
  }
})();
