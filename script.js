/************************************************************
 * CREOLE JAMAICAN ARTISTRY - MASTER SCRIPT
 * Developer: Niketa Muschette
 ************************************************************/

// --- 1. UTILITY FUNCTIONS ---
function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

// --- 2. AUTHENTICATION ---
const registrationForm = document.getElementById("registrationForm");
if (registrationForm) {
    registrationForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const firstName = document.getElementById("firstName").value.trim();
        const trn = document.getElementById("trn").value.trim();
        const dob = document.getElementById("dob").value;
        const password = document.getElementById("password").value;

        if (password.length < 8) return alert("Password must be 8+ characters.");
        if (calculateAge(dob) < 18) return alert("Must be 18 or older to shop.");
        if (!/^\d{3}-\d{3}-\d{3}$/.test(trn)) return alert("TRN Format: 000-000-000");

        let users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
        if (users.some(u => u.trn === trn)) return alert("TRN already registered.");

        users.push({ firstName, trn, dob, password: btoa(password) });
        localStorage.setItem("RegistrationData", JSON.stringify(users));
        alert("Registration Successful!");
        window.location.href = "login.html";
    });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    let attempts = 3;
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const trn = document.getElementById("loginTrn").value.trim();
        const pass = document.getElementById("loginPassword").value;
        const users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
        const user = users.find(u => u.trn === trn && u.password === btoa(pass));

        if (user) {
            localStorage.setItem("LoggedInUser", JSON.stringify(user));
            window.location.href = "products.html";
        } else {
            attempts--;
            const err = document.getElementById("errorMsg");
            if (err) err.innerText = `Invalid login. Attempts left: ${attempts}`;
            if (attempts === 0) window.location.href = "locked.html";
        }
    });
}

// --- 3. PRODUCT DATA ---
const products = [
    { name: "Rustic Burlap Tote", price: 3500, image: "burlap bag.jpg" },
    { name: "Artisan Serving Tray", price: 5800, image: "large tray .jpg" },
    { name: "Creole Accent Set", price: 4200, image: "collection.jpg" }
];

// --- 4. SHOPPING BAG LOGIC ---
function displayProducts() {
    const productGrid = document.querySelector(".product-grid");
    if (!productGrid) return;

    productGrid.innerHTML = products.map((product, index) => `
        <div class="product-card">
            <img src="Assets/${product.image}" class="product-image" alt="${product.name}" onerror="this.src='${product.image}'">
            <h3>${product.name}</h3>
            <p class="product-price">$${product.price.toLocaleString()} JMD</p>
            <button class="btn" onclick="addToCart(${index})">Add to Bag</button>
        </div>
    `).join('');
}

function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [], subtotal: 0, taxes: 0, discounts: 0, totalCost: 0 };
    cart.items.push(products[index]);
    
    // Recalculate Totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
    cart.discounts = cart.subtotal * 0.05; 
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15; 
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    
    // This updates the totals on the current page immediately
    updateSummaryUI(cart);
}

function displayCart() {
    const tableBody = document.getElementById("cart-table-body");
    if (!tableBody) return;

    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    tableBody.innerHTML = "";

    if (!cart || cart.items.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Your bag is empty.</td></tr>";
        updateSummaryUI(null);
        return;
    }

    cart.items.forEach((item) => {
        tableBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>$${item.price.toLocaleString()}.00</td>
                <td>1</td>
                <td>$${item.price.toLocaleString()}.00</td>
            </tr>`;
    });
    updateSummaryUI(cart);
}

function updateSummaryUI(cart) {
    const subEl = document.getElementById("cart-subtotal");
    if (!subEl) return; // Exit if the summary elements aren't on this page

    if (cart) {
        document.getElementById("cart-subtotal").innerText = "$" + cart.subtotal.toLocaleString() + ".00 JMD";
        document.getElementById("cart-discount").innerText = "-$" + cart.discounts.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
        document.getElementById("cart-tax").innerText = "$" + cart.taxes.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
        document.getElementById("cart-total").innerText = "$" + cart.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
        
        // Also update the checkout specific field if it exists
        const summaryTotal = document.getElementById("summary-total");
        if (summaryTotal) summaryTotal.innerText = "$" + cart.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
    } else {
        ["cart-subtotal", "cart-discount", "cart-tax", "cart-total"].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.innerText = "$0.00 JMD";
        });
    }
}

// --- 5. CHECKOUT & INVOICE GENERATION ---
function generateInvoice(event) {
    if (event) event.preventDefault();

    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    const nameInput = document.getElementById("custName");
    const addrInput = document.getElementById("custAddress");

    if (!cart || cart.items.length === 0) {
        alert("Nothing to checkout! Add items to your bag first.");
        return;
    }

    const newInvoice = {
        invoiceNumber: "CJA-" + Math.floor(Math.random() * 899999 + 100000),
        date: new Date().toLocaleDateString('en-JM'),
        shipping: { 
            name: nameInput ? nameInput.value : "Guest", 
            address: addrInput ? addrInput.value : "N/A" 
        },
        items: cart.items,
        subtotal: cart.subtotal,
        discount: cart.discounts,
        tax: cart.taxes,
        total: cart.totalCost
    };

    let history = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    history.push(newInvoice);
    localStorage.setItem("AllInvoices", JSON.stringify(history));

    localStorage.removeItem("ShoppingCart");
    window.location.href = "invoice.html";
}

// --- 6. INITIALIZE ---
document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    displayCart();
    
    // Load existing totals if returning to page
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (cart) updateSummaryUI(cart);
});
