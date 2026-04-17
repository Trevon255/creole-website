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
    if (!grid) return;

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

function displayCartTable() {
    const tableBody = document.getElementById("cart-table-body");
    if (!tableBody) return;

    const cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [] };
    if (cart.items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px; color: #888;">Your bag is currently empty.</td></tr>';
        return;
    }

    tableBody.innerHTML = cart.items.map((item, index) => `
        <tr>
            <td style="display: flex; align-items: center; gap: 15px;">
                <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <span style="font-weight: 500;">${item.name}</span>
            </td>
            <td>$${item.price.toLocaleString()}</td>
            <td>${item.quantity}</td>
            <td>$${(item.price * item.quantity).toLocaleString()}</td>
            <td><button onclick="removeItem(${index})" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:1.2rem;">&times;</button></td>
        </tr>
    `).join('');
}

// --- 3. CHECKOUT & INVOICE LOGIC ---
function generateInvoice() {
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    const nameInput = document.getElementById("cust-name");
    const amountInput = document.getElementById("amount-paid");

    if (!cart || cart.items.length === 0) {
        alert("Your bag is empty! Please add items before checking out.");
        return;
    }

    const name = nameInput.value.trim();
    const amountPaid = parseFloat(amountInput.value);

    if (!name || isNaN(amountPaid)) {
        alert("Please enter your full name and the amount you are paying.");
        return;
    }

    if (amountPaid < cart.totalCost) {
        alert("Insufficient amount. The total due is: $" + cart.totalCost.toLocaleString() + " JMD");
    } else {
        const change = amountPaid - cart.totalCost;
        
        // Show Success Message
        alert("Success! Thank you, " + name + ".\n\n" +
              "Order Total: $" + cart.totalCost.toLocaleString() + " JMD\n" +
              "Amount Paid: $" + amountPaid.toLocaleString() + " JMD\n" +
              "Your Change: $" + change.toLocaleString() + " JMD\n\n" +
              "Your order has been placed.");
        
        // Clear everything
        localStorage.removeItem("ShoppingCart");
        window.location.href = "index.html"; 
    }
}

// --- 4. CART & TOTALS CORE ---
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
    if (confirm("Are you sure you want to clear your entire shopping bag?")) {
        localStorage.removeItem("ShoppingCart");
        
        // Reset Table if on cart page
        displayCartTable();
        
        // Reset Summary UI
        updateSummaryUI({ subtotal: 0, discounts: 0, taxes: 0, totalCost: 0 });
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
    const totalEl = document.getElementById("cart-total") || document.getElementById("checkout-amount");

    if (subtotalEl) subtotalEl.innerText = fmt(cart.subtotal);
    if (discountEl) discountEl.innerText = (cart.discounts > 0 ? "-" : "") + fmt(cart.discounts);
    if (taxEl) taxEl.innerText = fmt(cart.taxes);
    if (totalEl) totalEl.innerText = fmt(cart.totalCost);
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    cart.items.splice(index, 1);
    
    if (cart.items.length === 0) {
        localStorage.removeItem("ShoppingCart");
        displayCartTable();
        updateSummaryUI({ subtotal: 0, discounts: 0, taxes: 0, totalCost: 0 });
    } else {
        localStorage.setItem("ShoppingCart", JSON.stringify(cart));
        displayCartTable();
        calculateTotals(cart);
    }
}

// --- 5. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    displayProductGrid();
    displayCartTable();
    
    const savedCart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (savedCart) {
        updateSummaryUI(savedCart);
    }
});
