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

// --- 2. LOGIN LOGIC ---
function checkLogin(event) {
    event.preventDefault(); 
    const enteredTrn = document.getElementById("loginTrn").value;
    const enteredPass = document.getElementById("loginPassword").value;
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    const userFound = users.find(u => u.trn === enteredTrn && u.password === enteredPass);

    if (userFound) {
        localStorage.setItem("currentUser", JSON.stringify(userFound));
        alert("Login Successful! Welcome, " + userFound.firstName);
        window.location.href = "products.html"; // Updated redirect to catalog
    } else {
        alert("Invalid credentials.");
    }
}

// --- 3. DISPLAY FUNCTIONS ---
function displayProductGrid() {
    const grid = document.getElementById("product-grid");
    if (!grid) {
        console.log("Product grid container not found on this page.");
        return;
    }

    grid.innerHTML = products.map((p, i) => `
        <div class="product-card" style="background: white; border: 1px solid #eee; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="margin: 10px 0;">${p.name}</h3>
            <p style="font-size: 0.9rem; color: #666; min-height: 40px;">${p.description}</p>
            <p style="font-weight: bold; color: #d63384; font-size: 1.2rem; margin: 15px 0;">$${p.price.toLocaleString()} JMD</p>
            <button onclick="addToCart(${i})" style="background: #d63384; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold;">Add to Bag</button>
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

// --- 4. CART & INVOICE LOGIC ---
function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [] };
    const selected = products[index];
    const existing = cart.items.find(item => item.id === selected.id);
    if (existing) { existing.quantity++; } 
    else { cart.items.push({ ...selected, quantity: 1 }); }
    calculateTotals(cart);
    alert(selected.name + " added to bag!");
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

function generateInvoice() {
    const name = document.getElementById("cust-name")?.value;
    const address = document.getElementById("cust-address")?.value;
    const paid = document.getElementById("amount-paid")?.value;
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    const user = JSON.parse(localStorage.getItem("currentUser")) || { trn: "Walk-in" };

    if (!name || !address || !paid || !cart || cart.items.length === 0) {
        alert("Please complete the shipping and payment details.");
        return;
    }

    const invoiceObj = {
        invoiceNumber: "CJ-" + Math.floor(100000 + Math.random() * 900000),
        trn: user.trn,
        customer: name,
        shipping: address,
        amountPaid: paid,
        totalDue: cart.totalCost,
        date: new Date().toLocaleDateString()
    };

    let history = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    history.push(invoiceObj);
    localStorage.setItem("AllInvoices", JSON.stringify(history));
    localStorage.removeItem("ShoppingCart");

    alert("Invoice Generated!");
    window.location.href = "invoice.html";
}

function clearCart() {
    localStorage.removeItem("ShoppingCart");
    alert("Bag cleared.");
    location.reload();
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    cart.items.splice(index, 1);
    calculateTotals(cart);
    if (cart.items.length === 0) {
        localStorage.removeItem("ShoppingCart");
        location.reload();
    } else {
        displayCartTable();
    }
}

// --- 5. DASHBOARD FUNCTIONS ---
function ShowUserFrequency() {
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    let genderStats = { Male: 0, Female: 0 };

    users.forEach(user => {
        if (user.gender === "Male") genderStats.Male++;
        else if (user.gender === "Female") genderStats.Female++;
    });

    const gDiv = document.getElementById("genderFrequency");
    if (gDiv) {
        gDiv.innerHTML = `Male: ${"█".repeat(genderStats.Male)} (${genderStats.Male})<br>Female: ${"█".repeat(genderStats.Female)} (${genderStats.Female})`;
    }
}

// --- 6. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Run the grid display
    displayProductGrid();
    
    // 2. Load cart data if it exists
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (cart) {
        updateSummaryUI(cart);
        displayCartTable();
    }
    
    // 3. Run dashboard if on dashboard page
    if (document.getElementById("genderFrequency")) {
        ShowUserFrequency();
    }
});
