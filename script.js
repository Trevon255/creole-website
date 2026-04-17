/************************************************************
 * CREOLE JAMAICAN ARTISTRY - MASTER SCRIPT
 * Developer: Niketa Muschette
 ************************************************************/

// 1. PRODUCT DATA
const products = [
    { id: 101, name: "Rustic Burlap Tote", price: 3500, description: "Hand-stitched natural fiber tote.", image: "Assets/burlap bag.jpg" },
    { id: 102, name: "Artisan Serving Tray", price: 5800, description: "Cedar wood tray with Jamaican patterns.", image: "Assets/large tray .jpg" },
    { id: 103, name: "Creole Accent Set", price: 4200, description: "Coasters and matching vase set.", image: "Assets/collection.jpg" }
];

// --- 2. DISPLAY FUNCTIONS ---
function displayProductGrid() {
    const grid = document.getElementById("product-grid");
    if (!grid) return; //

    grid.innerHTML = products.map((p, i) => `
        <div class="product-card" style="background: white; border: 1px solid #eee; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px;">
            <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
            <h3>${p.name}</h3>
            <p style="font-size: 0.9rem; color: #666; min-height: 40px;">${p.description}</p>
            <p style="font-weight: bold; color: #d63384; font-size: 1.2rem;">$${p.price.toLocaleString()} JMD</p>
            <button onclick="addToCart(${i})" style="background: #d63384; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold;">Add to Bag</button>
        </div>
    `).join('');
}

// --- 3. SHOPPING BAG TABLE RENDERING ---
function displayCartTable() {
    const tableBody = document.getElementById("cart-table-body");
    if (!tableBody) return;

    const cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [] };

    if (cart.items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Your bag is empty.</td></tr>';
        return;
    }

    tableBody.innerHTML = cart.items.map((item) => `
        <tr>
            <td style="display: flex; align-items: center; gap: 10px; padding: 10px;">
                <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                ${item.name}
            </td>
            <td>$${item.price.toLocaleString()}</td>
            <td>${item.quantity}</td>
            <td>$${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
    `).join('');
}

// --- 4. CART LOGIC ---
function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [] };
    const selected = products[index];
    const existing = cart.items.find(item => item.id === selected.id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.items.push({ ...selected, quantity: 1 });
    }

    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    calculateTotals(cart); 
    alert(selected.name + " added to bag!");
}

function clearCart() {
    if (confirm("Are you sure you want to clear your shopping bag?")) {
        localStorage.removeItem("ShoppingCart");
        location.reload(); // Refresh to update everything
    }
}

function calculateTotals(cart) {
    cart.subtotal = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    cart.discounts = cart.subtotal * 0.05;
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15;
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;
    
    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    updateSummaryUI(cart);
}

function updateSummaryUI(cart) {
    const fmt = (v) => "$" + (v || 0).toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
    
    const subtotalEl = document.getElementById("cart-subtotal");
    const discountEl = document.getElementById("cart-discount");
    const taxEl = document.getElementById("cart-tax");
    const totalEl = document.getElementById("cart-total");
    const checkoutTotalEl = document.getElementById("checkout-total"); // For checkout page

    if (subtotalEl) subtotalEl.innerText = fmt(cart.subtotal);
    if (discountEl) discountEl.innerText = fmt(cart.discounts);
    if (taxEl) taxEl.innerText = fmt(cart.taxes);
    if (totalEl) totalEl.innerText = fmt(cart.totalCost);
    if (checkoutTotalEl) checkoutTotalEl.innerText = fmt(cart.totalCost);
}

// --- 5. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    displayProductGrid(); //
    displayCartTable(); // Update the table if on cart.html
    
    const savedCart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (savedCart) {
        updateSummaryUI(savedCart);
    }
});
