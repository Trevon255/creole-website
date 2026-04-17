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
       let gender = document.getElementById("gender").value;
users.push({ firstName, trn, dob, gender, password: btoa(password) });
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
            <button type="button" class="btn" onclick="addToCart(${index})">Add to Bag</button>
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

    // Update the numbers at the bottom of products.html
    updateSummaryUI(cart);

    // Show a quick confirmation instead of jumping pages
    alert(`${products[index].name} has been added to your bag!`);
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

function emptyCart() {
    if (confirm("Clear all items from your bag?")) {
        localStorage.removeItem("ShoppingCart");
        if (document.getElementById("cart-table-body")) displayCart();
        updateSummaryUI(null);
    }
}

function updateSummaryUI(cart) {
    const ids = ["cart-subtotal", "cart-discount", "cart-tax", "cart-total", "summary-total"];

    if (cart) {
        const formattedTotal = "$" + cart.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";

        if (document.getElementById("cart-subtotal")) 
            document.getElementById("cart-subtotal").innerText = "$" + cart.subtotal.toLocaleString() + ".00 JMD";

        if (document.getElementById("cart-discount")) 
            document.getElementById("cart-discount").innerText = "-$" + cart.discounts.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";

        if (document.getElementById("cart-tax")) 
            document.getElementById("cart-tax").innerText = "$" + cart.taxes.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";

        if (document.getElementById("cart-total")) document.getElementById("cart-total").innerText = formattedTotal;
        if (document.getElementById("summary-total")) document.getElementById("summary-total").innerText = formattedTotal;
    } else {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.innerText = "$0.00 JMD";
        });
    }
}

// --- 5. CHECKOUT & INVOICE ---
function generateInvoice(event) {
    const addr = document.getElementById("custAddress")?.value || "N/A";
    let user = JSON.parse(localStorage.getItem("LoggedInUser"));
let trn = user?.trn || "000-000-000";
    if (event) event.preventDefault();

    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (!cart || cart.items.length === 0) return alert("Nothing to checkout!");

    const name = document.getElementById("custName")?.value || "Guest";
    const addr = document.getElementById("custAddress")?.value || "N/A";

  const newInvoice = {
    invoiceNumber: "CJA-" + Math.floor(Math.random() * 899999 + 100000),
    date: new Date().toLocaleDateString('en-JM'),
    trn: trn,
    shipping: { name: name, address: addr },
    items: cart.items,
    subtotal: cart.subtotal,
    tax: cart.taxes,
    discount: cart.discounts,
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
    const existingCart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (existingCart) updateSummaryUI(existingCart);
});


// -------- DASHBOARD --------

// Load all invoices
function loadInvoices() {
    let invoices = JSON.parse(localStorage.getItem("AllInvoices")) || [];

    let container = document.getElementById("invoiceList");
    if (!container) return;

    if (invoices.length === 0) {
        container.innerHTML = "<p>No invoices found.</p>";
        return;
    }

    container.innerHTML = invoices.map(inv => `
        <div style="border:1px solid #ccc; padding:10px; margin:10px;">
            <p><strong>Invoice:</strong> ${inv.invoiceNumber}</p>
            <p><strong>Date:</strong> ${inv.date}</p>
            <p><strong>Total:</strong> $${inv.total.toLocaleString()} JMD</p>
        </div>
    `).join('');
}

// Search invoice
function searchInvoice() {
    let trn = document.getElementById("searchTRN").value;

    let invoices = JSON.parse(localStorage.getItem("AllInvoices")) || [];

    let container = document.getElementById("invoiceList");

    if (!trn) {
        loadInvoices();
        return;
    }

    let results = invoices.filter(inv => inv.trn === trn);

    if (results.length === 0) {
        container.innerHTML = "<p>No matching invoices found.</p>";
        return;
    }

    container.innerHTML = results.map(inv => `
        <div style="border:1px solid #ccc; padding:10px; margin:10px;">
            <p><strong>Invoice:</strong> ${inv.invoiceNumber}</p>
            <p><strong>Total:</strong> $${inv.total.toLocaleString()} JMD</p>
        </div>
    `).join('');
}

// Run dashboard ONLY if dashboard page is open
if (document.getElementById("invoiceList")) {
    loadInvoices();
    showGenderFrequency();
    showAgeFrequency();
}

// -------- FREQUENCY --------

// Gender Frequency
function showGenderFrequency() {
    let users = JSON.parse(localStorage.getItem("RegistrationData")) || [];

    let counts = { Male: 0, Female: 0, Other: 0 };

    users.forEach(u => {
        if (counts[u.gender] !== undefined) {
            counts[u.gender]++;
        }
    });

    let container = document.getElementById("genderChart");
    if (!container) return;

    container.innerHTML = `
        <p>Male: ${counts.Male}</p>
        <p>Female: ${counts.Female}</p>
        <p>Other: ${counts.Other}</p>
    `;
}

// Age Frequency
function showAgeFrequency() {
    let users = JSON.parse(localStorage.getItem("RegistrationData")) || [];

    let groups = { "18-25": 0, "26-35": 0, "36+": 0 };

    users.forEach(u => {
        let age = calculateAge(u.dob);

        if (age >= 18 && age <= 25) groups["18-25"]++;
        else if (age <= 35) groups["26-35"]++;
        else groups["36+"]++;
    });

    let container = document.getElementById("ageChart");
    if (!container) return;

    container.innerHTML = `
        <p>18–25: ${groups["18-25"]}</p>
        <p>26–35: ${groups["26-35"]}</p>
        <p>36+: ${groups["36+"]}</p>
    `;
}


