/* ================================
   STORE.JS
   Gerenciamento de produtos e carrinho (suporte a qty)
   ================================ */

const PRODUCTS = [
  {
    id: 1,
    name: "Espada de Diamante",
    price: 149.90,
    promoEnabled: true,
    promoPrice: 119.90,
    img: "assets/images/produto1.png",
    description: "Espada poderosa para derrotar mobs e chefes"
  },
  {
    id: 2,
    name: "Calça Jeans",
    price: 129.90,
    img: "assets/images/produto2.png",
    description: "Picareta eficiente para mineração rápida"
  },
  {
    id: 3,
    name: "Poção de Cura (x3)",
    price: 29.90,
    img: "assets/images/produto3.png",
    description: "Três poções de cura para emergências"
  },
  {
    id: 4,
    name: "Armadura de Ferro (set)",
    price: 199.90,
    img: "assets/images/produto4.png",
    description: "Conjunto de armadura para proteção confiável"
  },
  {
    id: 5,
    name: "Tochas (x64)",
    price: 9.90,
    img: "assets/images/produto5.png",
    description: "Pacote com 64 tochas para iluminar suas cavernas"
  },
  {
    id: 6,
    name: "Bloco de Grama",
    price: 4.90,
    img: "assets/images/produto6.png",
    description: "Bloco decorativo para construção e paisagismo"
  }
];

export async function getProducts() {
  return PRODUCTS;
}

export function getCart(){
  try{
    const raw = localStorage.getItem('cart');
    const cart = raw ? JSON.parse(raw) : [];
    return cart.map(i => ({ id: i.id, name: i.name, price: Number(i.price), qty: Number(i.qty||1), img: i.img || '' }));
  }catch(e){
    return [];
  }
}

function saveCart(cart){
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(product, qty = 1){
  const cart = getCart();
  const existing = cart.find(i => i.id == product.id);
  if (existing){
    existing.qty = Number(existing.qty) + Number(qty);
    if (!existing.img && product.img) existing.img = product.img;
  } else {
    cart.push({ id: product.id, name: product.name, price: Number(product.price), qty: Number(qty), img: product.img || '' });
  }
  saveCart(cart);
}

export function updateQuantity(id, qty){
  const cart = getCart();
  const idx = cart.findIndex(i => i.id == id);
  if (idx === -1) return;
  qty = Number(qty);
  if (qty <= 0) cart.splice(idx, 1);
  else cart[idx].qty = qty;
  saveCart(cart);
}

export function removeFromCart(id){
  const cart = getCart();
  const idx = cart.findIndex(i => i.id == id);
  if (idx !== -1){
    cart.splice(idx,1);
    saveCart(cart);
  }
}

export function clearCart(){
  saveCart([]);
}

export function getCartTotal(){
  const cart = getCart();
  return cart.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
}

export function getCartCount(){
  const cart = getCart();
  return cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
}
