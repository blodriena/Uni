const PRODUCTS = [
  { id:1, name:'Maison Tote', category:'bags', price:285, emoji:'👜', badge:'New' },
  { id:2, name:'Silk Wrap Dress', category:'clothing', price:340, originalPrice:420, emoji:'👗', badge:'Sale' },
  { id:3, name:'Cashmere Coat', category:'clothing', price:890, emoji:'🧥', badge:'New' },
  { id:4, name:'Block Heel Mules', category:'shoes', price:195, emoji:'👠', badge:null },
  { id:5, name:'Vintage Crossbody', category:'bags', price:220, emoji:'👛', badge:null },
  { id:6, name:'Gold Chain Necklace', category:'accessories', price:145, emoji:'📿', badge:'New' },
  { id:7, name:'Linen Trousers', category:'clothing', price:175, emoji:'👖', badge:null },
  { id:8, name:'Leather Loafers', category:'shoes', price:310, originalPrice:380, emoji:'🥿', badge:'Sale' },
];

let cart = [];
let currentFilter = 'all';

function renderProducts(filter) {
  const grid = document.getElementById('products-grid');
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  grid.innerHTML = filtered.map((p, i) => `
    <div class="product-card" style="animation-delay:${i*0.07}s">
      <div class="product-img">
        ${p.badge ? `<span class="product-badge ${p.badge==='Sale'?'sale':''}">${p.badge}</span>` : ''}
        <span style="font-size:60px">${p.emoji}</span>
        <button class="quick-add" onclick="addToCart(${p.id})">+ Add to Cart</button>
      </div>
      <div class="product-category">${p.category}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">
        $${p.price}
        ${p.originalPrice ? `<span class="original">$${p.originalPrice}</span>` : ''}
      </div>
    </div>
  `).join('');
}

function filterProducts(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat);
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) { existing.qty++; }
  else { cart.push({ ...product, qty: 1 }); }
  updateCartUI();
  showToast(`${product.emoji} ${product.name} added to cart`);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
  renderCartItems();
}

function updateCartUI() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  const countEl = document.getElementById('cart-count');
  countEl.textContent = total;
  countEl.style.display = total > 0 ? 'flex' : 'none';
}

function renderCartItems() {
  const el = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  if (cart.length === 0) {
    el.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
    footer.style.display = 'none';
    return;
  }
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price} × ${item.qty}</div>
      </div>
      <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
    </div>
  `).join('');
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('cart-total-price').textContent = `$${total.toLocaleString()}`;
  footer.style.display = 'block';
}

function openCart() {
  renderCartItems();
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-sidebar').classList.add('open');
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-sidebar').classList.remove('open');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function setPrompt(text) {
  document.getElementById('ai-input').value = text;
  document.getElementById('ai-input').focus();
}

async function askAI() {
  const input = document.getElementById('ai-input');
  const btn = document.getElementById('ai-ask-btn');
  const responseBox = document.getElementById('ai-response');
  const responseText = document.getElementById('ai-response-text');
  const question = input.value.trim();
  if (!question) return;

  btn.disabled = true;
  responseBox.classList.add('visible');
  responseText.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

  const productList = PRODUCTS.map(p => `${p.name} (${p.category}, $${p.price})`).join(', ');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a sophisticated AI fashion stylist for LUXE, a luxury fashion store. Be warm, knowledgeable, and chic. Keep answers to 2-4 sentences — elegant and direct. Our current products: ${productList}. When relevant, naturally mention products from our store by name.`,
        messages: [{ role: 'user', content: question }]
      })
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text || 'I apologize, please try again.';
    responseText.textContent = reply;
  } catch(e) {
    responseText.textContent = 'Something went wrong. Please try again.';
  }

  btn.disabled = false;
  input.value = '';
}



renderProducts('all');