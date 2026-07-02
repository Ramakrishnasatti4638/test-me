const productsEl = document.getElementById('products');
const cartItemsEl = document.getElementById('cart-items');
const cartEmptyEl = document.getElementById('cart-empty');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const cartSidebar = document.getElementById('cart-sidebar');
const backdrop = document.getElementById('backdrop');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('close-cart');
const clearCartBtn = document.getElementById('clear-cart');

const fmt = (n) => `$${n.toFixed(2)}`;

function openCart() {
  cartSidebar.classList.add('open');
  backdrop.classList.add('open');
  cartSidebar.setAttribute('aria-hidden', 'false');
  backdrop.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  cartSidebar.classList.remove('open');
  backdrop.classList.remove('open');
  cartSidebar.setAttribute('aria-hidden', 'true');
  backdrop.setAttribute('aria-hidden', 'true');
}

openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
backdrop.addEventListener('click', closeCart);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCart();
});

async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();
  productsEl.innerHTML = '';
  for (const p of products) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">${p.image}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">${fmt(p.price)}</div>
      <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
    `;
    productsEl.appendChild(card);
  }

  productsEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    btn.disabled = true;
    btn.textContent = 'Adding...';
    try {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: Number(id) }),
      });
      btn.textContent = '✓ Added';
      btn.classList.add('added');
      await refreshCart();
      openCart();
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.classList.remove('added');
        btn.disabled = false;
      }, 900);
    } catch (err) {
      btn.textContent = 'Add to Cart';
      btn.disabled = false;
      console.error(err);
    }
  });
}

async function refreshCart() {
  const res = await fetch('/api/cart');
  const data = await res.json();
  const { items, total, count } = data;

  cartCountEl.textContent = count;
  cartCountEl.classList.toggle('hidden', count === 0);
  cartTotalEl.textContent = fmt(total);

  if (items.length === 0) {
    cartItemsEl.innerHTML = '';
    cartEmptyEl.classList.add('show');
    return;
  }
  cartEmptyEl.classList.remove('show');

  cartItemsEl.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-image">${item.image}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)} each</div>
        <div class="qty-controls">
          <button class="qty-btn qty-decrease" data-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn qty-increase" data-id="${item.id}">+</button>
        </div>
      </div>
      <div class="cart-item-subtotal">${fmt(item.subtotal)}</div>
    </div>
  `).join('');
}

cartItemsEl.addEventListener('click', async (e) => {
  const dec = e.target.closest('.qty-decrease');
  const inc = e.target.closest('.qty-increase');
  if (!dec && !inc) return;
  const btn = dec || inc;
  const id = Number(btn.dataset.id);

  const row = btn.closest('.cart-item');
  const qtyEl = row.querySelector('.qty-value');
  const currentQty = Number(qtyEl.textContent);
  const newQty = inc ? currentQty + 1 : currentQty - 1;

  btn.disabled = true;
  try {
    await fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id, quantity: newQty }),
    });
    await refreshCart();
  } catch (err) {
    console.error(err);
    btn.disabled = false;
  }
});

clearCartBtn.addEventListener('click', async () => {
  await fetch('/api/cart/clear', { method: 'POST' });
  await refreshCart();
});

(async function init() {
  await loadProducts();
  await refreshCart();
})();
