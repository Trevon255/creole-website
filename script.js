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

// --- 3. ADD TO CART (Object Requirement) ---
function addToCart(index) {
    // 1. Initialize the Object with all required properties
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { 
        items: [], 
        subtotal: 0, 
        taxes: 0, 
        discounts: 0, 
        totalCost: 0 
    };

    const selectedProduct = products[index];

    // 2. Add/Update Product Details in the items array
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

    // 3. Update Financial Details WITHIN the Cart Object
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.discounts = cart.subtotal * 0.05; // 5% Discount
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15; // 15% GCT
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    // 4. Save the full Object to localStorage
    localStorage.setItem("ShoppingCart", JSON.stringify(cart));

    // Update the UI totals at the bottom of the product page
    updateSummaryUI(cart);
    alert(`${selectedProduct.name} added to your Bag!`);
}

// --- 4. UI UPDATER ---
function updateSummaryUI(cart) {
    if (!cart) return;
    const fmt = (val) => "$" + val.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";

    if (document.getElementById("cart-subtotal")) document.getElementById("cart-subtotal").innerText = fmt(cart.subtotal);
    if (document.getElementById("cart-total")) document.getElementById("cart-total").innerText = fmt(cart.totalCost);
    
    // Additional fields for the Cart page
    if (document.getElementById("cart-discount")) document.getElementById("cart-discount").innerText = "-" + fmt(cart.discounts);
    if (document.getElementById("cart-tax")) document.getElementById("cart-tax").innerText = fmt(cart.taxes);
}

// --- 5. INITIALIZE ---
document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    
    const savedCart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (savedCart) updateSummaryUI(savedCart);
});

