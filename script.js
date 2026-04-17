/************************************************************
 * CREOLE JAMAICAN ARTISTRY - MASTER SCRIPT
 * Developer: Niketa Muschette
 ************************************************************/

// --- 1. PRODUCT CATALOGUE ---
const products = [
    { id: 101, name: "Rustic Burlap Tote", price: 3500, description: "Hand-stitched natural fiber tote.", image: "Assets/burlap bag.jpg" },
    { id: 102, name: "Artisan Serving Tray", price: 5800, description: "Cedar wood tray with Jamaican patterns.", image: "Assets/large tray .jpg" },
    { id: 103, name: "Creole Accent Set", price: 4200, description: "Coasters and matching vase set.", image: "Assets/collection.jpg" }
];

// --- 2. DYNAMIC PRODUCT DISPLAY ---
function displayProducts() {
    const grid = document.querySelector(".product-grid");
    if (!grid) return;

    grid.innerHTML = products.map((p, index) => `
        <div class="product-card">
            <img src="${p.image}" class="product-image" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <span class="product-price">$${p.price.toLocaleString()} JMD</span>
            <button onclick="addToCart(${index})" class="btn">Add to Cart</button>
        </div>
    `).join('');
}

// --- 3. ADD TO CART & CALCULATIONS ---
function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { 
        items: [], subtotal: 0, taxes: 0, discounts: 0, totalCost: 0 
    };

    const selectedProduct = products[index];
    const existing = cart.items.find(item => item.id === selectedProduct.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.items.push({ 
            id: selectedProduct.id, 
            name: selectedProduct.name, 
            price: selectedProduct.price, 
            quantity: 1 
        });
    }

    // UPDATED CALCULATIONS
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.discounts = cart.subtotal * 0.05; 
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15; 
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    updateSummaryUI(cart);
    alert(`${selectedProduct.name} added to bag! Details, Taxes, and Totals saved.`);
}

// --- 4. UI UPDATER (For Products and Cart Pages) ---
function updateSummaryUI(cart) {
    const fmt = (val) => "$" + (val || 0).toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
    
    const fields = {
        "cart-subtotal": cart?.subtotal,
        "cart-discount": cart?.discounts,
        "cart-tax": cart?.taxes,
        "cart-total": cart?.totalCost
    };

    for (let id in fields) {
        let el = document.getElementById(id);
        if (el) el.innerText = fmt(fields[id]);
    }
}

// --- 5. CHECKOUT SPECIFIC LOGIC ---
function displayCheckoutAmount() {
    const amountDisplay = document.getElementById("checkout-amount");
    if (!amountDisplay) return;

    const savedCart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (savedCart && savedCart.totalCost) {
        amountDisplay.innerText = "$" + savedCart.totalCost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " JMD";
    }
}

// --- 6. INITIALIZE ---
document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    displayCheckoutAmount(); // Runs specifically on the checkout page
    
    const saved = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (saved) updateSummaryUI(saved);
});
