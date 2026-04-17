/************************************************************
 * CREOLE JAMAICAN ARTISTRY - MASTER SCRIPT
 * Developer: Niketa Muschette
 ************************************************************/

// 1. PRODUCT DATA
const products = [
    { id: 101, name: "Rustic Burlap Tote", price: 3500, image: "Assets/burlap bag.jpg" },
    { id: 102, name: "Artisan Serving Tray", price: 5800, image: "Assets/large tray .jpg" },
    { id: 103, name: "Creole Accent Set", price: 4200, image: "Assets/collection.jpg" }
];

// --- 2. LOGIN LOGIC (UPDATED REDIRECT) ---
function checkLogin(event) {
    event.preventDefault(); 
    const enteredTrn = document.getElementById("loginTrn").value;
    const enteredPass = document.getElementById("loginPassword").value;
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    const userFound = users.find(u => u.trn === enteredTrn && u.password === enteredPass);

    if (userFound) {
        localStorage.setItem("currentUser", JSON.stringify(userFound));
        alert("Welcome, " + userFound.firstName);
        
        // REDIRECTS TO CATALOG PAGE UPON SUCCESS
        window.location.href = "products.html"; 
    } else {
        alert("Invalid credentials. Please check your TRN and Password.");
    }
}

// --- 3. CART & TOTALS LOGIC ---
function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [] };
    const selected = products[index];
    const existing = cart.items.find(item => item.id === selected.id);
    if (existing) { existing.quantity++; } else { cart.items.push({ ...selected, quantity: 1 }); }
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

// --- 4. CHECKOUT & INVOICE LOGIC ---
function generateInvoice() {
    const name = document.getElementById("cust-name")?.value;
    const address = document.getElementById("cust-address")?.value;
    const paid = document.getElementById("amount-paid")?.value;
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    const user = JSON.parse(localStorage.getItem("currentUser")) || { trn: "Walk-in" };

    if (!name || !address || !paid || !cart || cart.items.length === 0) {
        alert("Please complete all fields.");
        return;
    }

    const invoiceObj = {
        invoiceNumber: "CJ-" + Math.floor(100000 + Math.random() * 900000),
        trn: user.trn,
        customer: name,
        shipping: address,
        paidAmount: paid,
        totalDue: cart.totalCost,
        date: new Date().toLocaleDateString()
    };

    let history = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    history.push(invoiceObj);
    localStorage.setItem("AllInvoices", JSON.stringify(history));

    alert("Invoice Generated!");
    localStorage.removeItem("ShoppingCart");
    window.location.href = "invoice.html";
}

// --- 5. DASHBOARD STATS ---
function ShowUserFrequency() {
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    let genderStats = { Male: 0, Female: 0 };
    users.forEach(u => { 
        if(u.gender === "Male") genderStats.Male++; 
        else if(u.gender === "Female") genderStats.Female++; 
    });
    
    const gDiv = document.getElementById("genderFrequency");
    if (gDiv) {
        gDiv.innerHTML = `Male: ${"█".repeat(genderStats.Male)} (${genderStats.Male})<br>Female: ${"█".repeat(genderStats.Female)} (${genderStats.Female})`;
    }
}

// --- 6. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (cart) updateSummaryUI(cart);
    if (document.getElementById("genderFrequency")) ShowUserFrequency();
});
