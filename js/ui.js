/* ================================
   UI.JS
   Responsável apenas pela interface
   (renderização e eventos visuais)
   ================================ */

import {
  getProducts,
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
  getCartCount
} from "./store.js";

/* ---------- UTIL ---------- */
function toBRL(v){ try{ return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }catch{ return 'R$ ' + (Number(v)||0).toFixed(2).replace('.',','); } }

/* ---------- ELEMENTOS ---------- */
const productsContainer = document.querySelector(".products-list");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsContainer = document.querySelector(".cart-items");
const cartCount = document.querySelector(".cart-count");
const cartTotal = document.getElementById("cart-total");
const openCartBtn = document.getElementById("open-cart");
const closeCartBtn = document.getElementById("close-cart");
const checkoutLink = document.querySelector('.checkout-button');

/* ---------- PRODUTOS ---------- */
export async function renderProducts() {
  const products = await getProducts();
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = "<p>Nenhum produto cadastrado.</p>";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const basePrice = parseFloat(product.price);
    const promoEnabled = !!product.promoEnabled && product.promoPrice !== '' && !isNaN(parseFloat(product.promoPrice)) && parseFloat(product.promoPrice) > 0 && parseFloat(product.promoPrice) < basePrice;
    const promoPrice = promoEnabled ? parseFloat(product.promoPrice) : null;
    const priceHTML = promoEnabled 
      ? `<span class="price-old">${toBRL(basePrice)}</span><span class="price-new">${toBRL(promoPrice)}</span>`
      : `${toBRL(basePrice)}`;
    const badgeHTML = promoEnabled ? `<div class="badge-promo">Promo</div>` : '';

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.img}" alt="${product.name}">
      </div>

      <div class="product-info">
        ${badgeHTML}
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${priceHTML}</p>

        <button class="product-button" data-id="${product.id}">
          Adicionar ao carrinho
        </button>
      </div>
    `;

    if (promoEnabled) card.classList.add('promo');

    productsContainer.appendChild(card);
  });

  bindAddToCartButtons();
}

/* ---------- CARRINHO ---------- */
export function renderCart() {
  const cart = getCart();
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0){
    cartItemsContainer.innerHTML = `<div class="cart-empty">Seu carrinho está vazio.</div>`;
  }

  cart.forEach((item) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <div class="cart-item-left">
        <div class="cart-thumb"><img src="${item.img || 'assets/images/produto1.png'}" alt="${item.name}"></div>
        <div class="cart-meta">
          <div class="cart-name">${item.name}</div>
          <div class="cart-price">${toBRL(item.price)}</div>
        </div>
      </div>

      <div class="cart-item-right">
        <div class="qty-controls">
          <button class="qty-decrease" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
          <input class="qty-input" data-id="${item.id}" type="number" min="1" value="${item.qty}" aria-label="Quantidade do produto">
          <button class="qty-increase" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
        </div>
        <div class="cart-sub">${toBRL(item.price * item.qty)}</div>
        <button class="remove-item" data-id="${item.id}" aria-label="Remover item">✕</button>
      </div>
    `;

    cartItemsContainer.appendChild(div);
  });

  cartCount.textContent = getCartCount();
  cartTotal.textContent = toBRL(getCartTotal());

  // enable/disable checkout link based on cart contents
  const checkoutBtn = document.querySelector('.checkout-button');
  if (checkoutBtn) {
    if (cart.length === 0) {
      checkoutBtn.classList.add('disabled');
      checkoutBtn.setAttribute('aria-disabled', 'true');
      checkoutBtn.setAttribute('tabindex','-1');
    } else {
      checkoutBtn.classList.remove('disabled');
      checkoutBtn.removeAttribute('aria-disabled');
      checkoutBtn.removeAttribute('tabindex');
    }
  }

  bindCartItemEvents();
}

/* ---------- EVENTOS ---------- */
async function bindAddToCartButtons() {
  // only bind buttons that are inside a product card (avoid binding CTAs like checkout or promo view)
  document.querySelectorAll('.product-card .product-button').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const products = await getProducts();
      const product = products.find(p => p.id == id);

      if (!product) return;

      const basePrice = parseFloat(product.price);
      const promoEnabled = !!product.promoEnabled && product.promoPrice !== '' && !isNaN(parseFloat(product.promoPrice)) && parseFloat(product.promoPrice) > 0 && parseFloat(product.promoPrice) < basePrice;
      const priceToAdd = promoEnabled ? parseFloat(product.promoPrice) : parseFloat(product.price);

      addToCart({ id: product.id, name: product.name, price: priceToAdd, img: product.img }, 1);

      renderCart();
      openCart();

      // small visual feedback
      btn.textContent = 'Adicionado ✓';
      setTimeout(()=> btn.textContent = 'Adicionar ao carrinho', 900);
    };
  });
}

function bindCartItemEvents(){
  // qty buttons
  document.querySelectorAll('.qty-increase').forEach(b=> b.onclick = () => {
    const id = b.dataset.id; const current = document.querySelector(`.qty-input[data-id="${id}"]`);
    updateQuantity(id, Number(current.value||1) + 1); renderCart();
  });
  document.querySelectorAll('.qty-decrease').forEach(b=> b.onclick = () => {
    const id = b.dataset.id; const current = document.querySelector(`.qty-input[data-id="${id}"]`);
    const newQ = Number(current.value||1) - 1; updateQuantity(id, newQ); renderCart();
  });
  document.querySelectorAll('.qty-input').forEach(inp=> inp.onchange = () => {
    const id = inp.dataset.id; const v = Number(inp.value||1); if (isNaN(v) || v < 1) { inp.value = 1; updateQuantity(id,1);} else { updateQuantity(id,v); } renderCart();
  });

  // remove
  document.querySelectorAll('.remove-item').forEach(b=> b.onclick = () => { removeFromCart(b.dataset.id); renderCart(); });
}

/* ---------- ABRIR / FECHAR ---------- */
export function openCart() {
  cartSidebar.classList.add("active");
  cartOverlay.classList.add("active");
}

export function closeCart() {
  cartSidebar.classList.remove("active");
  cartOverlay.classList.remove("active");
}

/* ---------- BIND GLOBAL ---------- */
export function bindCartControls() {
  openCartBtn.onclick = openCart;
  closeCartBtn.onclick = closeCart;
  cartOverlay.onclick = closeCart;
  if (checkoutLink) checkoutLink.addEventListener('click', ()=> closeCart());

  // Clear cart (button created dynamically)
  const clearBtn = document.querySelector('.clear-cart');
  if (clearBtn) clearBtn.addEventListener('click', ()=> {
    if (confirm('Tem certeza que deseja limpar o carrinho?')){ clearCart(); renderCart(); }
  });
}

/* ---------- THEME ---------- */
function setTheme(theme){
  // add a temporary class to enable smooth transitions
  try{ document.documentElement.classList.add('with-transition'); }catch(e){ /* noop */ }

  // respect prefers-reduced-motion
  try{ if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { if (theme === 'light') document.documentElement.setAttribute('data-theme','light'); else document.documentElement.removeAttribute('data-theme'); localStorage.setItem('xd-theme', theme); setTimeout(()=>{ try{ document.documentElement.classList.remove('with-transition'); }catch(e){} }, 300); return; } }catch(e){}

  // create a themed overlay to mask repaints during the theme switch
  try{
    const existing = document.querySelector('.theme-fade');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'theme-fade ' + (theme === 'light' ? 'light' : 'dark');
    document.body.appendChild(overlay);
    // force a reflow so transition can be applied
    // eslint-disable-next-line no-unused-expressions
    overlay.offsetWidth; // trigger reflow

    // fade overlay in
    overlay.classList.add('visible');

    // add animating class to trigger the cross-fade + micro-zoom
    try{ if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) { document.documentElement.classList.add('theme-animating'); } }catch(e){}

    // apply the theme while the overlay covers the page to avoid flashes
    if (theme === 'light') document.documentElement.setAttribute('data-theme','light'); else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('xd-theme', theme);

    // ensure we remove the overlay later
    const FADE_MS = 1000; // should match CSS timing (updated to match CSS)

    // after a short delay, fade out the overlay and then remove transition class
    setTimeout(()=>{
      overlay.classList.remove('visible');
      setTimeout(()=>{ try{ overlay.remove(); }catch(e){} }, 260);
    }, FADE_MS - 220);

    // remove the transition and animating class after the fade + a bit of buffer
    setTimeout(()=>{ try{ document.documentElement.classList.remove('with-transition'); document.documentElement.classList.remove('theme-animating'); }catch(e){} }, FADE_MS + 120);
  }catch(e){
    // fallback: just apply theme and remove transition after a safe timeout
    if (theme === 'light') document.documentElement.setAttribute('data-theme','light');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('xd-theme', theme);
    setTimeout(()=>{ try{ document.documentElement.classList.remove('with-transition'); }catch(e){} }, 1000);
  }
}

function toggleTheme(){
  const current = localStorage.getItem('xd-theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme(){
  const saved = localStorage.getItem('xd-theme') || 'dark';
  setTheme(saved);
  const tbtn = document.getElementById('theme-toggle');
  if (tbtn) tbtn.onclick = toggleTheme;
}

function bindPromoButton(){
  const btn = document.getElementById('view-promos');
  if (!btn) return;
  btn.addEventListener('click', ()=>{
    const first = document.querySelector('.product-card.promo');
    if (first){ first.scrollIntoView({behavior:'smooth', block:'center'}); first.classList.add('promo-highlight'); setTimeout(()=> first.classList.remove('promo-highlight'), 1800); }
  });
}

/* ---------- MARQUEE (seamless) ---------- */
function debounce(fn, wait=150){
  let t;
  return (...args)=>{ clearTimeout(t); t = setTimeout(()=> fn(...args), wait); };
}

function initMarquee(){
  const marquee = document.querySelector('.marquee');
  if (!marquee) return;

  // Force marquee on by default (ignore prefers-reduced-motion to keep banner moving)
  const forced = true;
  marquee.style.animation = '';

  // Ensure we have two copies for seamless looping
  const spans = marquee.querySelectorAll('span');
  if (spans.length < 2){
    const text = marquee.textContent.trim();
    marquee.innerHTML = `<span>${text}</span><span aria-hidden="true">${text}</span>`;
  }

  const first = marquee.querySelector('span');
  if (!first) return;
  const styleId = 'xd-marquee-style';
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();

  // compute shift as width of one copy
  const shift = first.offsetWidth + 32; // small fudge for spacing
  const speed = 60; // pixels per second
  const duration = Math.max(6, Math.round((shift / speed) * 10) / 10);

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `@keyframes xdMarquee { 0%{ transform: translateX(0); } 100%{ transform: translateX(-${shift}px); } } .marquee { animation: xdMarquee ${duration}s linear infinite !important; }`;
  document.head.appendChild(style);
}

/* ---------- MOBILE DETECTION ---------- */
function detectMobile() {
  const isMobile = window.innerWidth < 768;
  document.body.classList.toggle('mobile', isMobile);
}

/* ---------- INIT ---------- */
export async function initUI() {
  initTheme();
  await renderProducts();
  renderCart();
  bindCartControls();
  bindPromoButton();
  initMarquee();
  detectMobile();
  window.addEventListener('resize', debounce(initMarquee, 200));
  window.addEventListener('resize', debounce(detectMobile, 200));
}

// Auto init on DOMContentLoaded
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUI); else initUI();