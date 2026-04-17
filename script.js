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
            <button onclick="addToCart(${i})" style="background: #d63384; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; width: 100%;">Add to Bag</button>
        </div>
    `).join('');
}

// --- 3. CART LOGIC ---
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
    calculateTotals(cart); // This calculates and updates the UI
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
    
    // Selecting IDs based on your HTML structure
    const subtotalEl = document.getElementById("cart-subtotal");
    const discountEl = document.getElementById("cart-discount");
    const taxEl = document.getElementById("cart-tax");
    const totalEl = document.getElementById("cart-total");

    if (subtotalEl) subtotalEl.innerText = fmt(cart.subtotal);
    if (discountEl) discountEl.innerText = fmt(cart.discounts);
    if (taxEl) taxEl.innerText = fmt(cart.taxes);
    if (totalEl) totalEl.innerText = fmt(cart.totalCost);
}

// --- 4. DASHBOARD STATS (Fixes your 1st Screenshot) ---
function ShowDashboardStats() {
    const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    let genderStats = { Male: 0, Female: 0 };
    let ageStats = { "18-25": 0, "26-35": 0, "36+": 0 };

    users.forEach(user => {
        // Gender counting
        if (user.gender === "Male") genderStats.Male++;
        else if (user.gender === "Female") genderStats.Female++;

        // Age counting based on Date of Birth
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

// --- 5. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    displayProductGrid();
    
    // Update summary if data exists in storage
    const savedCart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (savedCart) {
        updateSummaryUI(savedCart);
    }
    
    // Check if we are on the Dashboard page
    if (document.getElementById("genderFrequency")) {
        ShowDashboardStats();
    }
});
