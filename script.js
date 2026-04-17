/************************************************************
 * CREOLE JAMAICAN ARTISTRY - MASTER SCRIPT
 * Developer: Niketa Muschette
 ************************************************************/

// ==========================================
// 1. GLOBAL FUNCTIONS (Clear Bag Logic)
// ==========================================

// This is renamed to clearBag to match your HTML button
window.clearBag = function() {
    console.log("clearBag function triggered"); 
    
    if (confirm("Are you sure you want to empty your shopping bag?")) {
        // 1. Wipe the specific cart data from local storage
        localStorage.removeItem("ShoppingCart");
        
        // 2. Force the summary UI back to zero immediately
        const resetTotals = { subtotal: 0, discounts: 0, taxes: 0, totalCost: 0 };
        updateSummaryUI(resetTotals);
        
        // 3. Refresh the page to clear the table rows
        window.location.reload();
    }
};

// ==========================================
// 2. PRODUCT DATA
// ==========================================
const products = [
    { id: 101, name: "Rustic Burlap Tote", price: 3500, description: "Hand-stitched natural fiber tote.", image: "Assets/burlap bag.jpg" },
    { id: 102, name: "Artisan Serving Tray", price: 5800, description: "Cedar wood tray with Jamaican patterns.", image: "Assets/large tray .jpg" },
    { id: 103, name: "Creole Accent Set", price: 4200, description: "Coasters and matching vase set.", image: "Assets/collection.jpg" }
];

// ==========================================
// 3. LOGIN & SECURITY
// ==========================================
let loginAttempts = parseInt(sessionStorage.getItem("loginAttempts")) || 0; 

function handleLogin(event) {
    if (event) event.preventDefault(); 
    const trnField = document.getElementById("loginTrn");
    const passField = document.getElementById("loginPassword");
    const errorMsg = document.getElementById("errorMsg");

    if(!trnField || !passField) return;

    const trnInput = trnField.value.trim();
    const passInput = passField.value;
    const storedData = JSON.parse(localStorage.getItem("RegistrationData"));

    if (!storedData) {
        if (errorMsg) errorMsg.innerText = "No registration found. Please create an account.";
        return;
    }

    if (storedData.trn === trnInput && storedData.password === passInput) {
        alert("Login Successful! Welcome to Creole.");
        sessionStorage.setItem("loginAttempts", 0);
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "products.html"; 
    } else {
        loginAttempts++;
        sessionStorage.setItem("loginAttempts", loginAttempts);
        if (loginAttempts >= 3) {
            alert("Account Locked: Maximum attempts reached.");
            window.location.href = "locked.html"; 
        } else {
            if (errorMsg) errorMsg.innerText = `Invalid credentials. Attempt ${loginAttempts} of 3.`;
        }
    }
}

// ==========================================
// 4. DISPLAY FUNCTIONS
// ==========================================
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

// ==========================================
// 5. SHOPPING LOGIC
// ==========================================
function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [] };
    const selected = products[index];
    const existing = cart.items.find(item => item.id === selected.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.items.push({ ...selected, quantity: 1 });
    }
    calculateTotals(cart);
    alert(selected.name + " added to bag!");
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    cart.items.splice(index, 1);
    if (cart.items.length === 0) {
        localStorage.removeItem("ShoppingCart");
        location.reload(); 
    } else {
        calculateTotals(cart);
        displayCartTable();
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

// ==========================================
// 6. INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Populate visuals based on page
    if (document.getElementById("product-grid")) displayProductGrid();
    if (document.getElementById("cart-table-body")) displayCartTable();

    // 2. Initialize totals on the Cart Page
    const savedCart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (savedCart) {
        updateSummaryUI(savedCart);
    } else {
        updateSummaryUI({ subtotal: 0, discounts: 0, taxes: 0, totalCost: 0 });
    }

    // 3. Setup Listeners
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
});
