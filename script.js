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
    alert("Registration Successful!");
    window.location.href = "login.html"; 
}

function checkLogin(event) {
    event.preventDefault(); 
    const enteredTrn = document.getElementById("loginTrn").value;
    const enteredPass = document.getElementById("loginPassword").value;
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    const userFound = users.find(u => u.trn === enteredTrn && u.password === enteredPass);
    
    if (userFound) {
        // FIX: Save the user so the Invoice can find the TRN later
        localStorage.setItem("currentUser", JSON.stringify(userFound));
        alert("Login Successful! Welcome, " + userFound.firstName);
        window.location.href = "index.html"; 
    } else {
        loginAttempts++;
        if (loginAttempts >= 3) {
            window.location.href = "error.html"; 
        } else {
            alert("Invalid credentials. Attempts remaining: " + (3 - loginAttempts));
        }
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
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;">Your bag is empty.</td></tr>';
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
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    const user = JSON.parse(localStorage.getItem("currentUser")) || { trn: "N/A" };

    if (!name || !address || !cart || cart.items.length === 0) {
        alert("Please fill in shipping details.");
        return;
    }

    const invoiceObj = {
        invoiceNumber: "CJ-" + Math.floor(100000 + Math.random() * 900000),
        trn: user.trn,
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

function clearCart() {
    localStorage.removeItem("ShoppingCart");
    alert("Bag cleared.");
    location.reload();
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
    // FIX: Automatically load dashboard stats if on the dashboard page
    if (document.getElementById("genderFrequency")) ShowUserFrequency();
});
