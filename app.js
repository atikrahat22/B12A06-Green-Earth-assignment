// -------------------- CONFIG & SELECTORS --------------------
const API_BASE = 'https://openapi.programming-hero.com/api';

const selectors = {
    categories: document.getElementById('categories'),
    catSpinner: document.getElementById('catSpinner'),
    productsGrid: document.getElementById('productsGrid'),
    productsSpinner: document.getElementById('productsSpinner'),
    cartContents: document.getElementById('cartContents'),
    cartTotal: document.getElementById('cartTotal'),
    detailModal: document.getElementById('detailModal'),
     detailPrice: document.getElementById('detailPrice'),
    detailTitle: document.getElementById('detailTitle'),
    detailDesc: document.getElementById('detailDesc'),
    detailImage: document.getElementById('detailImage'),
    detailClose: document.getElementById('detailClose'),
    detailAdd: document.getElementById('detailAdd'),
    plantForm: document.getElementById('plantForm'),
    cartDrawerToggle: document.getElementById('cartDrawerToggle'),
    animatedLogo: document.getElementById('animatedLogo'),
    cartContentsDrawer: document.getElementById('cartContentsDrawer'),
    cartTotalDrawer: document.getElementById('cartTotalDrawer'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    checkoutBtnDrawer: document.getElementById('checkoutBtnDrawer'),
};

// -------------------- STATE --------------------
let categories = [];
let products = [];
let currentCategoryId = null;
let cart = JSON.parse(localStorage.getItem('ge_cart') || '[]');
updateCartUI();

// -------------------- UTILITY FUNCTIONS --------------------
function qsa(sel) { return document.querySelectorAll(sel); }
function show(el) { el && el.classList.remove('hidden'); }
function hide(el) { el && el.classList.add('hidden'); }

function getField(obj, keys) {
    if (!obj) return null;
    for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
    }
    return null;
}

function computeFallbackPrice(id) {
    const s = String(id || '');
    let sum = 0;
    for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
    return ((sum % 80) + 20).toFixed(2);
}

function currency(n) { return `৳${Number(n).toFixed(2)}`; }

function getPlantDetailById(id) {
    return products.find(p => String(getField(p, ['id', '_id', 'plant_id'])) === String(id)) || null;
}

// -------------------- API FETCHERS --------------------
async function safeJson(res) {
    try { return await res.json(); }
    catch (e) { console.error("JSON parsing error:", e); return null; }
}

async function fetchCategories() {
    selectors.categories.innerHTML = '';
    show(selectors.catSpinner);
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const json = await safeJson(res);
        let arr = (json && (json.data || json.categories || json.data?.data || json));
        if (!Array.isArray(arr)) arr = [];
        categories = arr;
        renderCategoryButtons(categories);
    } catch (err) {
        console.error('categories failed', err);
        selectors.categories.innerHTML = '<div class="text-sm text-red-500">ক্যাটেগরি লোড করা যায়নি</div>';
    } finally { hide(selectors.catSpinner); }
}

async function fetchAllPlants() {
    show(selectors.productsSpinner);
    try {
        const res = await fetch(`${API_BASE}/plants`);
        const json = await safeJson(res);
        let arr = (json && (json.data || json.plants || json.data?.data || json));
        if (!Array.isArray(arr)) arr = [];
        products = arr;
        renderProducts(products);
    } catch (err) {
        console.error('plants failed', err);
        selectors.productsGrid.innerHTML = '<div class="text-sm text-red-500">ডেটা লোড করা যায়নি</div>';
    } finally { hide(selectors.productsSpinner); }
}

async function fetchPlantsByCategory(id) {
    currentCategoryId = id;

    const btns = selectors.categories.querySelectorAll('button');
    btns.forEach(b => {
        if ((id === null || id === 'all') && b.dataset.id === 'all') {
            b.classList.add('btn-primary');
            b.classList.remove('btn-ghost');
        } else if (b.dataset.id === String(id)) {
            b.classList.add('btn-primary');
            b.classList.remove('btn-ghost');
        } else {
            b.classList.remove('btn-primary');
            b.classList.add('btn-ghost');
        }
    });

    show(selectors.animatedLogo);
    show(selectors.productsSpinner);

    try {
        let url = id === null || id === 'all' ? `${API_BASE}/plants` : `${API_BASE}/category/${id}`;
        const res = await fetch(url);
        const json = await safeJson(res);
        let arr = (json && (json.data || json.plants || json.data?.data || json));
        if (!Array.isArray(arr)) arr = [];
        products = arr;
        renderProducts(products);
    } catch (err) {
        console.error('category failed', err);
        selectors.productsGrid.innerHTML = '<div class="text-sm text-red-500">ডেটা লোড করা যায়নি</div>';
    } finally {
        hide(selectors.productsSpinner);
        hide(selectors.animatedLogo);
    }
}

// -------------------- RENDER FUNCTIONS --------------------
function renderCategoryButtons(arr) {
    selectors.categories.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.textContent = 'All';
    allBtn.className = 'btn btn-primary justify-start';
    allBtn.dataset.id = 'all';
    allBtn.addEventListener('click', () => fetchPlantsByCategory('all'));
    selectors.categories.appendChild(allBtn);

    for (const c of arr) {
        const id = getField(c, ['id', '_id', 'category_id', 'categoryId']) || (c ? (c.id || c._id) : null);
        const name = getField(c, ['name', 'category_name', 'category']) || c || 'Unknown';
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.className = 'btn btn-ghost justify-start';
        btn.dataset.id = String(id || name);
        btn.addEventListener('click', () => fetchPlantsByCategory(btn.dataset.id));
        selectors.categories.appendChild(btn);
    }
}

function renderProducts(arr) {
    selectors.productsGrid.innerHTML = '';
    if (!arr || arr.length === 0) {
        selectors.productsGrid.innerHTML = '<div class="text-center text-muted"> plant cant be found </div>';
        return;
    }

    for (const p of arr) {
        const id = getField(p, ['id', '_id', 'plant_id']) || '';
        const name = getField(p, ['name', 'plant_name', 'common_name']) || 'Unnamed Tree';
        const image = getField(p, ['image', 'image_url', 'img', 'thumbnail']) || 'https://via.placeholder.com/150x100?text=Tree+Image';
        const desc = getField(p, ['short_description', 'short_desc', 'description', 'details']) || 'A fast-growing tropical tree.';
        const category = getField(p, ['category_name', 'category', 'cat']) || 'Fruit Tree';
        const priceRaw = getField(p, ['price', 'cost', 'amount']) || null;
        const price = priceRaw ? Number(priceRaw) : Number(computeFallbackPrice(id));

        const card = document.createElement('div');
        card.className = 'card bg-white hover:shadow-lg transition cursor-pointer card-no-border';
        card.innerHTML = `
            <figure class="h-48 overflow-hidden flex items-center justify-center bg-white p-4">
                <img src="${image}" alt="${name}" class="object-cover h-full w-full rounded" />
            </figure>
            <div class="card-body p-4 pt-0">
                <h3 class="font-bold text-lg leading-tight mt-2">${name}</h3>
                <p class="text-sm text-gray-600 line-clamp-2">${desc}</p>
                <div class="flex items-center justify-between mt-3">
                    <span class="badge badge-success px-3 py-1 text-sm">${category}</span> <span class="font-bold text-lg">${currency(price)}</span>
                </div>
                <button class="btn bg-[#006106] hover:bg-[#005005] text-white px-[20px] py-[12px] h-[43px] rounded-full mt-4 add-to-cart" data-id="${id}" data-name="${name}" data-price="${price}">Add to Cart</button>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                return;
            }
            openDetailModal(id);
        });

        selectors.productsGrid.appendChild(card);
    }

    selectors.productsGrid.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => handleAddToCartClick(e, btn));
    });
}

// -------------------- CART FUNCTIONS --------------------
function saveCart() { localStorage.setItem('ge_cart', JSON.stringify(cart)); }

function updateCartUI() {
    selectors.cartContents.innerHTML = '';
    if(selectors.cartContentsDrawer) selectors.cartContentsDrawer.innerHTML = '';

    if (cart.length === 0) {
        const emptyMessage = '<div class="text-sm text-gray-500 text-center">Your cart is empty.</div>';
        selectors.cartContents.innerHTML = emptyMessage;
        selectors.cartTotal.textContent = currency(0);
        if(selectors.cartContentsDrawer) selectors.cartContentsDrawer.innerHTML = emptyMessage;
        if(selectors.cartTotalDrawer) selectors.cartTotalDrawer.textContent = currency(0);
        saveCart(); return;
    }

    let total = 0;
    cart.forEach(item => {
        const rowHTML = `
            <div class="flex items-center justify-between gap-2 py-2 border-b border-gray-200 bg-green-100 rounded px-2">
                <div class="flex-grow ">
                    <div class="font-medium text-sm">${item.name}</div>
                    <div class="text-xs text-gray-500">${currency(item.price)} x ${item.qty}</div>
                </div>
                <div class="text-right">
                    <button class="btn btn-ghost btn-xs remove-item" data-id="${item.id}">❌</button>
                </div>
            </div>
        `;
        selectors.cartContents.insertAdjacentHTML('beforeend', rowHTML);
        if(selectors.cartContentsDrawer) selectors.cartContentsDrawer.insertAdjacentHTML('beforeend', rowHTML);
        total += item.price * item.qty;
    });

    selectors.cartTotal.textContent = currency(total);
    if(selectors.cartTotalDrawer) selectors.cartTotalDrawer.textContent = currency(total);

    selectors.cartContents.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
    if(selectors.cartContentsDrawer) {
        selectors.cartContentsDrawer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
        });
    }

    saveCart();
}

function addToCart(item) {
    const idx = cart.findIndex(c => String(c.id) === String(item.id));
    if (idx >= 0) cart[idx].qty += item.qty;
    else cart.push({ ...item, qty: 1 });
    updateCartUI();
    
}

function removeFromCart(id) {
    cart = cart.filter(i => String(i.id) !== String(id));
    updateCartUI();
    alert('Item has been removed from your cart.');
}

// -------------------- MODAL & FORM --------------------
let lastDetail = null;
function openDetailModal(id) {
    const detail = getPlantDetailById(id);
    lastDetail = detail;

    if (!detail) {
        alert('Details for this plant could not be loaded.');
        return;
    }

    const name = getField(detail, ['name', 'plant_name', 'common_name']) || 'Tree Detail';
    const desc = getField(detail, ['description', 'details', 'about']) || 'No details available.';
    const img = getField(detail, ['image', 'image_url', 'img']) || 'https://via.placeholder.com/150x100?text=Tree+Image';
    const priceRaw = getField(detail, ['price', 'cost']) || null;
    const price = priceRaw ? Number(priceRaw) : Number(computeFallbackPrice(id));

    selectors.detailTitle.textContent = name;
    selectors.detailDesc.textContent = desc;
    selectors.detailImage.innerHTML = `<img src="${img}" alt="${name}" class="w-full h-[400px] object-cover rounded" />`;
    selectors.detailPrice.textContent = currency(price);
    selectors.detailAdd.dataset.id = id;
    selectors.detailAdd.dataset.name = name;
    selectors.detailAdd.dataset.price = price;

    selectors.detailModal.classList.add('modal-open');
}

selectors.detailClose.addEventListener('click', () => selectors.detailModal.classList.remove('modal-open'));
selectors.detailAdd.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    const name = e.target.dataset.name;
    const price = Number(e.target.dataset.price || 0);
    addToCart({ id, name, price, qty: 1 });
    selectors.detailModal.classList.remove('modal-open');
});

// -------------------- INITIALIZATION --------------------
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchAllPlants();

    document.getElementById('plantBtn')?.addEventListener('click', () => {
        document.getElementById('plant')?.scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('ctaHero')?.addEventListener('click', () => {
        document.getElementById('plant')?.scrollIntoView({ behavior: 'smooth' });
    });

    selectors.plantForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(selectors.plantForm);
        const name = fd.get('name');
        const email = fd.get('email');
        const count = fd.get('count') || 1;
        alert(`${name} — Thank you! Your request to plant ${count} trees has been recorded.`);
        selectors.plantForm.reset();
    });

    selectors.checkoutBtn.addEventListener('click', () => handleCheckout(selectors.cartTotal));
    selectors.checkoutBtnDrawer?.addEventListener('click', () => handleCheckout(selectors.cartTotalDrawer, true));

    document.querySelectorAll('[data-target]').forEach(el => {
        const target = +el.dataset.target;
        let cur = 0;
        const step = Math.max(1, Math.floor(target / 80));
        const t = setInterval(() => {
            cur += step;
            if (cur >= target) { el.textContent = target + (target > 999 ? '+' : ''); clearInterval(t); }
            else el.textContent = cur;
        }, 15);
    });
});

// -------------------- CHECKOUT & ADD TO CART FUNCTIONS --------------------
function handleCheckout(cartTotalEl, isDrawer = false) {
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    const pageLoaderDiv = selectors.animatedLogo.cloneNode(true);
    pageLoaderDiv.classList.remove('hidden');
    pageLoaderDiv.classList.add('fixed', 'inset-0', 'bg-transparent', 'z-50', 'flex', 'justify-center', 'items-center');

    document.body.appendChild(pageLoaderDiv);

    setTimeout(() => {
        alert('Checkout demo: total ' + cartTotalEl.textContent);
        cart = [];
        updateCartUI();
        if (isDrawer && selectors.cartDrawerToggle) selectors.cartDrawerToggle.checked = false;
        pageLoaderDiv.remove();
    }, 1500);
}

function handleAddToCartClick(e, btn) {
    e.preventDefault();

    const pageLoaderDiv = selectors.animatedLogo.cloneNode(true);
    pageLoaderDiv.classList.remove('hidden');
    pageLoaderDiv.classList.add('fixed', 'inset-0', 'bg-transparent', 'z-50', 'flex', 'justify-center', 'items-center');

    document.body.appendChild(pageLoaderDiv);

    const buttonLoaderDiv = selectors.animatedLogo.cloneNode(true);
    buttonLoaderDiv.classList.remove('hidden');
    buttonLoaderDiv.classList.add('absolute', 'bg-transparent', 'pointer-events-none', 'flex', 'justify-center', 'items-center');

    const originalBtnContent = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '';
    btn.style.position = 'relative';
    btn.appendChild(buttonLoaderDiv);

    buttonLoaderDiv.style.width = '100%';
    buttonLoaderDiv.style.height = '100%';
    buttonLoaderDiv.style.top = '0';
    buttonLoaderDiv.style.left = '0';

    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = Number(btn.dataset.price || 0);

    setTimeout(() => {
        addToCart({ id, name, price, qty: 1 });
        btn.disabled = false;
        btn.innerHTML = originalBtnContent;
        buttonLoaderDiv.remove();
        pageLoaderDiv.remove();
        alert(`${name} has been added to your cart.`);
    }, 1500);
}