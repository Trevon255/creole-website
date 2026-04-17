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

// --- 2. DISPLAY FUNCTIONS ---
function displayProductGrid() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    grid.innerHTML = products.map((p, i) => `
        <div class="product-card" style="border: 1px solid #eee; padding: 20px; border-radius: 12px; text-align: center;">
            <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;">
            <h3>${p.name}</h3>
            <p style="font-weight: bold; color: #d63384;">$${p.price.toLocaleString()} JMD</p>
            <button onclick="addToCart(${i})" style="background: #d63384; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; width: 100%;">Add to Bag</button>
        </div>
    `).join('');
}

function displayCartTable() {
    const body = document.getElementById("cart-table-body");
    if (!body) return;
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (!cart || cart.items.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Your bag is empty.</td></tr>';
        return;
    }
    body.innerHTML = cart.items.map((item, index) => `
        <tr>
            <td style="padding: 10px;">${item.name}</td>
            <td>$${item.price.toLocaleString()}</td>
            <td>${item.quantity}</td>
            <td>$${(item.price * item.quantity).toLocaleString()}</td>
            <td><button onclick="removeItem(${index})" style="color: red; border: none; background: none; cursor: pointer;">Remove</button></td>
        </tr>
    `).join('');
}

function displayCheckoutDetails() {
    const el = document.getElementById("checkout-item-details");
    if (!el) return;
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (cart && cart.items) {
        el.innerHTML = cart.items.map(i => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>${i.quantity}x ${i.name}</span>
                <span>$${(i.price * i.quantity).toLocaleString()} JMD</span>
            </div>
        `).join('');
    }
}

// --- 3. CART LOGIC ---
function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [] };
    const selected = products[index];
    const existing = cart.items.find(item => item.id === selected.id);
    if (existing) { existing.quantity++; } 
    else { cart.items.push({ ...selected, quantity: 1 }); }
    calculateTotals(cart);
    alert(selected.name + " added!");
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
    const ids = ["cart-subtotal", "cart-discount", "cart-tax", "cart-total", "checkout-amount"];
    ids.forEach(id => {
        let el = document.getElementById(id);
        if (el) {
            let val = id.includes("discount") ? cart.discounts : (id.includes("tax") ? cart.taxes : (id.includes("subtotal") ? cart.subtotal : cart.totalCost));
            el.innerText = fmt(val);
        }
    });
}

// --- 4. THE INVOICE GENERATOR (New & Updated) ---
function generateInvoice() {
    const name = document.getElementById("cust-name")?.value;
    const address = document.getElementById("cust-address")?.value;
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));

    if (!name || !address || !cart || cart.items.length === 0) {
        alert("Please provide shipping details.");
        return;
    }

    // A. Generate Metadata
    const invoiceID = "CJ-" + Math.floor(100000 + Math.random() * 900000);
    const today = new Date().toLocaleDateString();
    const trn = "TRN-009-876-543";

    // B. Build Invoice Object
    const invoiceObj = {
        company: "Creole Jamaican Artistry",
        invoiceNumber: invoiceID,
        trn: trn,
        date: today,
        customer: name,
        shipping: address,
        items: cart.items,
        subtotal: cart.subtotal,
        discountTotal: cart.discounts,
        taxTotal: cart.taxes,
        grandTotal: cart.totalCost
    };

    // C. Store to "AllInvoices" Array
    let history = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    history.push(invoiceObj);
    localStorage.setItem("AllInvoices", JSON.stringify(history));

    // D. Visual Display
    let itemSummary = cart.items.map(i => `${i.name} x${i.quantity} - $${(i.price * i.quantity).toLocaleString()}`).join('\n');
    
    const receipt = `
========================================
       CREOLE JAMAICAN ARTISTRY
            OFFICIAL INVOICE
========================================
Invoice #: ${invoiceID}
Date: ${today} | TRN: ${trn}
----------------------------------------
Bill To: ${name}
Address: ${address}
----------------------------------------
Items:
${itemSummary}
----------------------------------------
Subtotal: $${cart.subtotal.toLocaleString()}
Discount (5%): -$${cart.discounts.toLocaleString()}
GCT (15%): $${cart.taxes.toLocaleString()}
TOTAL COST: $${cart.totalCost.toLocaleString()} JMD
========================================
Invoice sent to your email!
    `;

    alert(receipt);
    localStorage.removeItem("ShoppingCart");
    window.location.href = "index.html";
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    cart.items.splice(index, 1);
    calculateTotals(cart);
    displayCartTable();
}

function clearCart() {
    if(confirm("Clear Bag?")) { localStorage.removeItem("ShoppingCart"); location.reload(); }
}

// --- 5. INIT ---
document.addEventListener("DOMContentLoaded", () => {
    displayProductGrid();
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (cart) {
        updateSummaryUI(cart);
        displayCartTable();
        displayCheckoutDetails();
    }
});
