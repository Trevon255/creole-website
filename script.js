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

// --- 2. ADD TO CART & MATH LOGIC ---
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

    calculateTotals(cart);
}

function calculateTotals(cart) {
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.discounts = cart.subtotal * 0.05; 
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15; 
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    updateSummaryUI(cart);
}

// --- 3. UI UPDATER (Math Display) ---
function updateSummaryUI(cart) {
    const fmt = (val) => "$" + (val || 0).toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
    
    const fields = {
        "cart-subtotal": cart.subtotal,
        "cart-discount": cart.discounts,
        "cart-tax": cart.taxes,
        "cart-total": cart.totalCost,
        "checkout-amount": cart.totalCost // Syncs to Checkout Page
    };

    for (let id in fields) {
        let el = document.getElementById(id);
        if (el) el.innerText = fmt(fields[id]);
    }
}

// --- 4. CART TABLE RENDERER ---
function displayCartTable() {
    const tableBody = document.getElementById("cart-table-body");
    if (!tableBody) return;

    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));

    if (!cart || !cart.items || cart.items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 50px;">Your shopping bag is empty.</td></tr>';
        return;
    }

    tableBody.innerHTML = cart.items.map((item, index) => `
        <tr>
            <td style="padding: 15px; font-weight: 600;">${item.name}</td>
            <td style="padding: 15px;">$${item.price.toLocaleString()} JMD</td>
            <td style="padding: 15px;">${item.quantity}</td>
            <td style="padding: 15px;">$${(item.price * item.quantity).toLocaleString()} JMD</td>
            <td style="padding: 15px;">
                <button onclick="removeItem(${index})" style="color: #e74c3c; background: none; border: none; cursor: pointer; font-weight: bold;">Remove</button>
            </td>
        </tr>
    `).join('');
}

// --- 5. CHECKOUT & INVOICE GENERATION ---
function displayCheckoutDetails() {
    const detailsDisplay = document.getElementById("checkout-item-details");
    if (!detailsDisplay) return;

    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (cart && cart.items) {
        detailsDisplay.innerHTML = cart.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.95rem;">
                <span>${item.quantity}x ${item.name}</span>
                <span style="font-weight: 600;">$${(item.price * item.quantity).toLocaleString()} JMD</span>
            </div>
        `).join('');
    }
}

// This function was missing from your version!
function generateInvoice() {
    const name = document.getElementById("cust-name")?.value;
    const address = document.getElementById("cust-address")?.value;
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));

    if (!name || !address) {
        alert("Please enter your name and delivery address.");
        return;
    }

    let itemSummary = cart.items.map(item => 
        `${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()} JMD`
    ).join('\n');

    const receipt = `
========================================
       CREOLE JAMAICAN ARTISTRY
            ORDER INVOICE
========================================
Customer: ${name}
Address: ${address}
----------------------------------------
ITEMS:
${itemSummary}
----------------------------------------
TOTAL PAID: $${cart.totalCost.toLocaleString()} JMD
========================================
    `;

    alert(receipt);
    localStorage.removeItem("ShoppingCart");
    window.location.href = "index.html";
}

// --- 6. REMOVE & CLEAR FUNCTIONS ---
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    cart.items.splice(index, 1);
    calculateTotals(cart);
    displayCartTable();
}

function clearCart() {
    if (confirm("Clear your entire shopping bag?")) {
        localStorage.removeItem("ShoppingCart");
        location.reload(); 
    }
}

// --- 7. INITIALIZE ---
document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (cart) {
        updateSummaryUI(cart);
        displayCartTable();       // Runs on Cart page
        displayCheckoutDetails(); // Runs on Checkout page
    }
});
