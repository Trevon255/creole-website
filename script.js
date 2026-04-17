/************************************************************
 * CREOLE JAMAICAN ARTISTRY - MASTER SCRIPT
 * Developer: Niketa Muschette
 ************************************************************/

// Question 1: Create an array of product objects in JavaScript.
const products = [
    { id: 101, name: "Rustic Burlap Tote", price: 3500, description: "Hand-stitched natural fiber tote.", image: "Assets/burlap bag.jpg" },
    { id: 102, name: "Artisan Serving Tray", price: 5800, description: "Cedar wood tray with Jamaican patterns.", image: "Assets/large tray .jpg" },
    { id: 103, name: "Creole Accent Set", price: 4200, description: "Coasters and matching vase set.", image: "Assets/collection.jpg" }
];

// --- 2. DISPLAY FUNCTIONS ---

// Question 2: Display the product list dynamically on the website.
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

// Question 3: Create a shopping cart page that lists items.
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

// Question 4: Show a summary of the shopping cart with the total cost.
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

// Question 5: Add selected product to the shopping cart.
function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [] };
    const selected = products[index];
    const existing = cart.items.find(item => item.id === selected.id);
    if (existing) { existing.quantity++; } 
    else { cart.items.push({ ...selected, quantity: 1 }); }
    calculateTotals(cart);
    alert(selected.name + " added!");
}

// Question 6: Calculate and display total price of items in the cart (Taxes 15%, Discount 5%).
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

// --- 4. THE INVOICE GENERATOR ---

// Question 7: Generate an invoice and store in AllInvoices array in localStorage.
function generateInvoice() {
    const name = document.getElementById("cust-name")?.value;
    const address = document.getElementById("cust-address")?.value;
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));

    if (!name || !address || !cart || cart.items.length === 0) {
        alert("Please provide shipping details.");
        return;
    }

    const invoiceID = "CJ-" + Math.floor(100000 + Math.random() * 900000);
    const today = new Date().toLocaleDateString();
    const trn = "TRN-009-876-543"; 

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

    let history = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    history.push(invoiceObj);
    localStorage.setItem("AllInvoices", JSON.stringify(history));

    alert("Invoice Generated Successfully!");
    localStorage.removeItem("ShoppingCart");
    window.location.href = "invoice.html";
}

// Question 8 & 9: Remove items and Clear Cart.
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    cart.items.splice(index, 1);
    calculateTotals(cart);
    displayCartTable();
}

function clearCart() {
    if(confirm("Clear Bag?")) { localStorage.removeItem("ShoppingCart"); location.reload(); }
}

/************************************************************
 * DASHBOARD & ADMIN FUNCTIONALITIES
 ************************************************************/

// Question 10: ShowUserFrequency() – Simple Frequency Stats
function ShowUserFrequency() {
    // Ensuring it uses "RegistrationData" per requirements
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    
    let genderStats = { Male: 0, Female: 0, Other: 0 };
    let ageStats = { "18-25": 0, "26-35": 0, "36-50": 0, "50+": 0 };

    users.forEach(user => {
        // Count Gender
        if (genderStats[user.gender] !== undefined) genderStats[user.gender]++;
        
        // Count Age Group
        const birthYear = new Date(user.dob).getFullYear();
        const age = new Date().getFullYear() - birthYear;

        if (age >= 18 && age <= 25) ageStats["18-25"]++;
        else if (age >= 26 && age <= 35) ageStats["26-35"]++;
        else if (age >= 36 && age <= 50) ageStats["36-50"]++;
        else if (age > 50) ageStats["50+"]++;
    });

    const genderDiv = document.getElementById("genderFrequency");
    const ageDiv = document.getElementById("ageFrequency");

    if (genderDiv) {
        genderDiv.innerHTML = `
            <p><strong>Male:</strong> ${genderStats.Male}</p>
            <p><strong>Female:</strong> ${genderStats.Female}</p>
            <p><strong>Other:</strong> ${genderStats.Other}</p>
        `;
    }

    if (ageDiv) {
        ageDiv.innerHTML = `
            <p><strong>18-25:</strong> ${ageStats["18-25"]}</p>
            <p><strong>26-35:</strong> ${ageStats["26-35"]}</p>
            <p><strong>36-50:</strong> ${ageStats["36-50"]}</p>
            <p><strong>50+:</strong> ${ageStats["50+"]}</p>
        `;
    }
}

// Question 11: ShowInvoices() - Log to console
function ShowInvoices() {
    const allInvoices = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    console.log("--- Stored Invoices ---", allInvoices);
    alert("Invoice list sent to the console (F12).");
}

// Question 12: GetUserInvoices() – Filter by TRN
function GetUserInvoices() {
    const allInvoices = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    const searchTRN = document.getElementById("searchTRN")?.value;
    const displayArea = document.getElementById("invoiceDisplayArea");

    if (!searchTRN) return;

    const results = allInvoices.filter(inv => inv.trn === searchTRN);

    displayArea.innerHTML = results.length ? 
        results.map(inv => `<p>Invoice: ${inv.invoiceNumber} | Date: ${inv.date} | Total: $${inv.grandTotal}</p>`).join('') : 
        `<p style="color:red;">No invoices found for TRN: ${searchTRN}</p>`;
}

// --- 5. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    displayProductGrid();
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (cart) {
        updateSummaryUI(cart);
        displayCartTable();
        displayCheckoutDetails();
    }
    
    if (document.getElementById("genderFrequency")) {
        ShowUserFrequency();
    }
});
