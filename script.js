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

// --- 2. REGISTRATION & LOGIN LOGIC ---

let loginAttempts = 0; 

function saveRegistration(event) {
    event.preventDefault(); 
    const newUser = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        dob: document.getElementById("dob").value,
        gender: document.getElementById("gender").value,
        email: document.getElementById("email").value,
        trn: document.getElementById("trn").value,
        password: document.getElementById("password").value 
    };
    let users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    users.push(newUser);
    localStorage.setItem("RegistrationData", JSON.stringify(users));
    alert("Registration Successful, " + newUser.firstName + "! You can now log in.");
    window.location.href = "login.html"; 
}

function checkLogin(event) {
    event.preventDefault(); 
    const enteredTrn = document.getElementById("loginTrn").value;
    const enteredPass = document.getElementById("loginPassword").value;
    const errorDisplay = document.getElementById("errorMsg");
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    const userFound = users.find(u => u.trn === enteredTrn && u.password === enteredPass);

    if (userFound) {
        alert("Login Successful! Welcome, " + userFound.firstName);
        window.location.href = "index.html"; 
    } else {
        loginAttempts++;
        let remaining = 3 - loginAttempts;
        if (loginAttempts >= 3) {
            alert("Account Locked: Too many failed attempts.");
            window.location.href = "error.html"; 
        } else {
            errorDisplay.innerText = `Invalid credentials. Attempts remaining: ${remaining}`;
        }
    }
}

function resetPassword() {
    const trn = prompt("Enter your registered TRN to reset password:");
    if (!trn) return;
    let users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    const userIndex = users.findIndex(u => u.trn === trn);
    if (userIndex !== -1) {
        const newPass = prompt("Enter new password (min 8 characters):");
        if (newPass && newPass.length >= 8) {
            users[userIndex].password = newPass;
            localStorage.setItem("RegistrationData", JSON.stringify(users));
            alert("Password updated! You can now log in.");
        } else {
            alert("Update failed. Password too short.");
        }
    } else {
        alert("TRN not found.");
    }
}

// --- 3. DISPLAY FUNCTIONS ---

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

// --- 4. CART & INVOICE LOGIC ---

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

/**
 * UPDATED: updateSummaryUI
 * Now changes title to 'Shopping Cart' and lists product details
 */
function updateSummaryUI(cart) {
    const fmt = (v) => "$" + (v || 0).toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
    
    // 1. Update Title to Shopping Cart
    const titleEl = document.querySelector(".summary-box h3") || document.getElementById("summary-title");
    if (titleEl) titleEl.innerText = "Shopping Cart";

    // 2. Insert Product Details into the summary
    // We check if a list div exists; if not, we create one before the subtotal
    let listEl = document.getElementById("summary-item-list");
    if (!listEl) {
        listEl = document.createElement("div");
        listEl.id = "summary-item-list";
        listEl.style.marginBottom = "15px";
        listEl.style.fontSize = "0.85em";
        listEl.style.borderBottom = "1px solid #eee";
        const subtotalRow = document.getElementById("cart-subtotal")?.closest('div') || titleEl.nextSibling;
        titleEl.parentNode.insertBefore(listEl, subtotalRow);
    }

    if (cart.items.length > 0) {
        listEl.innerHTML = cart.items.map(item => `
            <div style="display:flex; justify-content:space-between; padding: 4px 0;">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toLocaleString()}</span>
            </div>
        `).join('');
    } else {
        listEl.innerHTML = "<em>Your bag is empty.</em>";
    }

    // 3. Update existing totals
    const ids = ["cart-subtotal", "cart-discount", "cart-tax", "cart-total", "checkout-amount"];
    ids.forEach(id => {
        let el = document.getElementById(id);
        if (el) {
            let val;
            if (id.includes("subtotal")) val = cart.subtotal;
            else if (id.includes("discount")) val = cart.discounts;
            else if (id.includes("tax")) val = cart.taxes;
            else val = cart.totalCost;
            el.innerText = fmt(val);
        }
    });
}

function generateInvoice() {
    const name = document.getElementById("cust-name")?.value;
    const address = document.getElementById("cust-address")?.value;
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));

    if (!name || !address || !cart || cart.items.length === 0) {
        alert("Please provide shipping details.");
        return;
    }

    const invoiceObj = {
        invoiceNumber: "CJ-" + Math.floor(100000 + Math.random() * 900000),
        trn: document.getElementById("loginTrn")?.value || "N/A", 
        date: new Date().toLocaleDateString(),
        customer: name,
        shipping: address,
        items: cart.items,
        grandTotal: cart.totalCost
    };

    let history = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    history.push(invoiceObj);
    localStorage.setItem("AllInvoices", JSON.stringify(history));

    alert("Invoice Generated!");
    localStorage.removeItem("ShoppingCart");
    window.location.href = "invoice.html";
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    cart.items.splice(index, 1);
    calculateTotals(cart);
    displayCartTable();
}

// --- 5. DASHBOARD FUNCTIONS ---

function ShowUserFrequency() {
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    let genderStats = { Male: 0, Female: 0, Other: 0 };
    let ageStats = { "18-25": 0, "26-35": 0, "36-50": 0, "50+": 0 };

    users.forEach(user => {
        if (genderStats[user.gender] !== undefined) genderStats[user.gender]++;
        const age = new Date().getFullYear() - new Date(user.dob).getFullYear();
        if (age >= 18 && age <= 25) ageStats["18-25"]++;
        else if (age >= 26 && age <= 35) ageStats["26-35"]++;
        else if (age >= 36 && age <= 50) ageStats["36-50"]++;
        else if (age > 50) ageStats["50+"]++;
    });

    const gDiv = document.getElementById("genderFrequency");
    const aDiv = document.getElementById("ageFrequency");

    if (gDiv) gDiv.innerHTML = `Male: ${"█".repeat(genderStats.Male)} (${genderStats.Male})<br>Female: ${"█".repeat(genderStats.Female)} (${genderStats.Female})`;
    if (aDiv) aDiv.innerHTML = `18-25: ${"█".repeat(ageStats["18-25"])} (${ageStats["18-25"]})`;
}

// --- 6. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    displayProductGrid();
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (cart) {
        updateSummaryUI(cart);
        displayCartTable();
    }
    if (document.getElementById("genderFrequency")) ShowUserFrequency();
});
