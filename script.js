

// --- UTILITY FUNCTIONS ---
function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

function getUsers() { return JSON.parse(localStorage.getItem("RegistrationData")) || []; }
function saveUsers(users) { localStorage.setItem("RegistrationData", JSON.stringify(users)); }

// --- AUTHENTICATION ---
const registrationForm = document.getElementById("registrationForm");
if (registrationForm) {
    registrationForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const firstName = document.getElementById("firstName").value.trim();
        const trn = document.getElementById("trn").value.trim();
        const dob = document.getElementById("dob").value;
        const password = document.getElementById("password").value;

        if (password.length < 8) return alert("Password must be 8+ characters.");
        if (calculateAge(dob) < 18) return alert("Must be 18 or older.");
        if (!/^\d{3}-\d{3}-\d{3}$/.test(trn)) return alert("Format: 000-000-000");

        let users = getUsers();
        if (users.some(u => u.trn === trn)) return alert("TRN already exists.");

        users.push({ firstName, trn, dob, password: btoa(password), invoices: [] });
        saveUsers(users);
        window.location.href = "login.html";
    });
}

// --- PRODUCT DATA ---
const products = [
    { name: "Rustic Burlap Tote", price: 3500, description: "Hand-stitched natural jute.", image: "burlap bag.jpg" },
    { name: "Artisan Serving Tray", price: 5800, description: "Handcrafted tray with carved handles.", image: "large tray .jpg" },
    { name: "Creole Accent Set", price: 4200, description: "Decorative duo pieces.", image: "collection.jpg" }
];

// --- NIKETA MUSCHETTE - CART & TABLE LOGIC ---
function displayProducts() {
    const productGrid = document.querySelector(".product-grid");
    if (!productGrid) return;
    productGrid.innerHTML = products.map((product, index) => `
        <div class="product-card">
            <img src="Assets/${product.image}" alt="${product.name}" class="product-image" onerror="this.src='${product.image}'"> 
            <h3 class="product-title">${product.name}</h3>
            <span class="product-price">$${product.price.toLocaleString()} JMD</span>
            <button class="btn buy-btn" onclick="addToCart(${index})">Add to Cart</button>
        </div>
    `).join('');
}

function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [], subtotal: 0, taxes: 0, discounts: 0, totalCost: 0 };
    cart.items.push(products[index]);
    
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price, 0);
    cart.discounts = cart.subtotal * 0.05;
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15;
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    window.location.href = "cart.html";
}

function displayCartItems() {
    const tableBody = document.getElementById("cart-table-body");
    if (!tableBody) return;

    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    tableBody.innerHTML = ""; 

    if (!cart || cart.items.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='4' style='text-align:center; padding:20px;'>Your bag is empty.</td></tr>";
        updateCartUI(null);
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
    updateCartUI(cart);
}

function updateCartUI(cart) {
    const ids = ["cart-subtotal", "cart-tax", "cart-discount", "cart-total"];
    if (!document.getElementById(ids[0])) return;

    if (cart && cart.items.length > 0) {
        document.getElementById("cart-subtotal").innerText = "$" + cart.subtotal.toLocaleString() + ".00 JMD";
        document.getElementById("cart-tax").innerText = "$" + cart.taxes.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
        document.getElementById("cart-discount").innerText = "-$" + cart.discounts.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
        document.getElementById("cart-total").innerText = "$" + cart.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
    } else {
        ids.forEach(id => document.getElementById(id).innerText = "$0.00 JMD");
    }
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    displayCartItems(); // This triggers the table to fill
});

// --- INVOICE GENERATION ---
function generateInvoice(event) {
    if (event) event.preventDefault();
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (!cart) return alert("Cart is empty");

    const newInvoice = {
        invoiceNumber: "CJA-" + Date.now().toString().slice(-6),
        date: new Date().toLocaleDateString('en-JM'),
        shipping: { 
            name: document.getElementById("custName").value, 
            address: document.getElementById("custAddress").value 
        },
        items: cart.items,
        total: cart.totalCost
    };

    let all = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    all.push(newInvoice);
    localStorage.setItem("AllInvoices", JSON.stringify(all));
    localStorage.removeItem("ShoppingCart");
    window.location.href = "invoice.html";
}

