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
        } else if (errorDisplay) {
            errorDisplay.innerText = `Invalid credentials. Attempts remaining: ${remaining}`;
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

// --- 4. CART LOGIC ---

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
    
    // This updates the numbers ONLY if they are found on the page
    const ids = ["cart-subtotal", "cart-discount", "cart-tax", "cart-total", "checkout-amount"];
    ids.forEach(id => {
        let el = document.getElementById(id);
        if (el) {
            let val = id.includes("discount") ? cart.discounts : 
                     (id.includes("tax") ? cart.taxes : 
                     (id.includes("subtotal") ? cart.subtotal : cart.totalCost));
            el.innerText = fmt(val);
        }
    });
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (!cart) return;
    cart.items.splice(index, 1);
    calculateTotals(cart);
    displayCartTable();
}

// --- 5. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    displayProductGrid();
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (cart) {
        updateSummaryUI(cart);
        displayCartTable();
    }
});
