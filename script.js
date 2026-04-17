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
    const enteredTrn = document.getElementById("loginTrn")?.value;
    const enteredPass = document.getElementById("loginPassword")?.value;
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    
    const userFound = users.find(u => u.trn === enteredTrn && u.password === enteredPass);

    if (userFound) {
        localStorage.setItem("currentUser", JSON.stringify(userFound));
        alert("Login Successful! Welcome, " + userFound.firstName);
        window.location.href = "products.html"; 
    } else {
        alert("Invalid credentials. Please check your TRN and Password.");
    }
}

// --- 3. DISPLAY FUNCTIONS ---
function displayProductGrid() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.innerHTML = products.map((p, i) => `
        <div class="product-card" style="background: white; border: 1px solid #eee; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px;">
            <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
            <h3>${p.name}</h3>
            <p style="font-size: 0.9rem; color: #666; min-height: 40px;">${p.description}</p>
            <p style="font-weight: bold; color: #d63384; font-size: 1.2rem;">$${p.price.toLocaleString()} JMD</p>
            <button onclick="addToCart(${i})" style="background: #d63384; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; width: 100%;">Add to Bag</button>
        </div>
    `).join('');
}

// --- 4. CART & TOTALS ---
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
}

// --- 5. DASHBOARD & SEARCH (The "Fix" for your screenshots) ---
function ShowDashboardStats() {
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    let genderStats = { Male: 0, Female: 0 };
    let ageStats = { "18-25": 0, "26-35": 0, "36+": 0 };

    users.forEach(user => {
        if (user.gender === "Male") genderStats.Male++;
        else if (user.gender === "Female") genderStats.Female++;

        if (user.dob) {
            const age = new Date().getFullYear() - new Date(user.dob).getFullYear();
            if (age <= 25) ageStats["18-25"]++;
            else if (age <= 35) ageStats["26-35"]++;
            else ageStats["36+"]++;
        }
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

function GetUserInvoices() {
    const searchInput = document.getElementById("searchTRN")?.value;
    const resultsDiv = document.getElementById("invoiceDisplayArea");
    const allInvoices = JSON.parse(localStorage.getItem("AllInvoices")) || [];

    if (!resultsDiv) return;

    const filtered = allInvoices.filter(inv => inv.trn === searchInput);

    if (filtered.length === 0) {
        resultsDiv.innerHTML = `<p style="color: #d63384;">No invoices found for TRN: ${searchInput}</p>`;
        return;
    }

    resultsDiv.innerHTML = filtered.map(inv => `
        <div style="border-bottom: 1px solid #ddd; padding: 10px;">
            <p><strong>Invoice:</strong> ${inv.invoiceNumber}</p>
            <p><strong>Paid:</strong> $${Number(inv.amountPaid).toLocaleString()} JMD</p>
        </div>
    `).join('');
}

// --- 6. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    displayProductGrid(); // Fixes the blank collection
    
    if (document.getElementById("genderFrequency")) {
        ShowDashboardStats(); // Fixes the age/gender bars
    }
});
