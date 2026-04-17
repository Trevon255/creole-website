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

// --- 2. LOGIN & AUTH LOGIC ---
function checkLogin(event) {
    event.preventDefault(); 
    const enteredTrn = document.getElementById("loginTrn").value;
    const enteredPass = document.getElementById("loginPassword").value;
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    const userFound = users.find(u => u.trn === enteredTrn && u.password === enteredPass);

    if (userFound) {
        localStorage.setItem("currentUser", JSON.stringify(userFound));
        alert("Login Successful! Welcome, " + userFound.firstName);
        window.location.href = "products.html"; 
    } else {
        alert("Invalid credentials.");
    }
}

// --- 3. PRODUCT GRID & CART DISPLAY ---
function displayProductGrid() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

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

// --- 4. CART CALCULATIONS & INVOICING ---
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
    const user = JSON.parse(localStorage.getItem("currentUser")) || { trn: "N/A" };

    if (!name || !address || !paid || !cart || cart.items.length === 0) {
        alert("Please complete all shipping and payment details.");
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

// --- 5. DASHBOARD & SEARCH FUNCTIONS ---
function ShowDashboardStats() {
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    let genderStats = { Male: 0, Female: 0 };
    let ageStats = { "18-25": 0, "26-35": 0, "36+": 0 };

    users.forEach(user => {
        // Gender Statistics
        if (user.gender === "Male") genderStats.Male++;
        else if (user.gender === "Female") genderStats.Female++;

        // Age Statistics (Calculation based on DOB)
        const age = new Date().getFullYear() - new Date(user.dob).getFullYear();
        if (age <= 25) ageStats["18-25"]++;
        else if (age <= 35) ageStats["26-35"]++;
        else ageStats["36+"]++;
    });

    const gDiv = document.getElementById("genderFrequency");
    const aDiv = document.getElementById("ageFrequency");

    if (gDiv) {
        gDiv.innerHTML = `Male: ${"█".repeat(genderStats.Male)} (${genderStats.Male})<br>` +
                         `Female: ${"█".repeat(genderStats.Female)} (${genderStats.Female})`;
    }
    if (aDiv) {
        aDiv.innerHTML = `18-25: ${"█".repeat(ageStats["18-25"])} (${ageStats["18-25"]})<br>` +
                         `26-35: ${"█".repeat(ageStats["26-35"])} (${ageStats["26-35"]})<br>` +
                         `36+: ${"█".repeat(ageStats["36+"])} (${ageStats["36+"]})`;
    }
}

// Function to handle the TRN Search Results on the Dashboard
function displayResults() {
    const searchInput = document.getElementById("trnSearchInput")?.value;
    const resultsDiv = document.getElementById("searchResultsDisplay");
    const allInvoices = JSON.parse(localStorage.getItem("AllInvoices")) || [];

    if (!resultsDiv) return;

    const filtered = allInvoices.filter(inv => inv.trn === searchInput);

    if (filtered.length === 0) {
        resultsDiv.innerHTML = `<p style="color: #e74c3c;">No records found for TRN: ${searchInput}</p>`;
        return;
    }

    resultsDiv.innerHTML = `
        <table border="1" style="width:100%; border-collapse: collapse; margin-top: 15px; background: white;">
            <tr style="background: #f8f9fa;">
                <th style="padding: 10px;">Invoice #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Date</th>
            </tr>
            ${filtered.map(inv => `
                <tr>
                    <td style="padding: 8px; text-align: center;">${inv.invoiceNumber}</td>
                    <td>${inv.customer}</td>
                    <td style="text-align: right; padding-right: 10px;">$${Number(inv.totalDue).toLocaleString()}</td>
                    <td style="text-align: center;">${inv.date}</td>
                </tr>
            `).join('')}
        </table>
    `;
}

// Logic to pull the last saved order from AllInvoices
 // Created by: Lee
document.addEventListener("DOMContentLoaded", () => {
     const history = JSON.parse(localStorage.getItem("AllInvoices"));
            if (history && history.length > 0) {
                const data = history[history.length - 1]; 
                
                document.getElementById("displayInvNum").innerText = data.invoiceNumber;
                document.getElementById("displayDate").innerText = data.date;
                document.getElementById("displayShipName").innerText = data.customer;
                document.getElementById("displayShipAddr").innerText = data.shipping;

                const fmt = (v) => "$" + (v || 0).toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";

                document.getElementById("displaySubtotal").innerText = fmt(data.subtotal);
                document.getElementById("displayTax").innerText = fmt(data.taxTotal);
                document.getElementById("displayDiscount").innerText = "-" + fmt(data.discountTotal);
                document.getElementById("displayGrandTotal").innerText = fmt(data.grandTotal);

                const itemTable = document.getElementById("invoiceItemsBody");
                itemTable.innerHTML = data.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.price.toLocaleString()}</td>
                        <td>$${(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                `).join('');
            }
        
// --- 6. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    displayProductGrid();
    
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (cart) {
        updateSummaryUI(cart);
        displayCartTable();
    }
    
    // Auto-load dashboard if on the right page
    if (document.getElementById("genderFrequency")) {
        ShowDashboardStats();
    }
});
