
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

// --- QUESTION 1: AUTHENTICATION ---
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

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    let attempts = 3;
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const trn = document.getElementById("loginTrn").value.trim();
        const pass = document.getElementById("loginPassword").value;
        const user = getUsers().find(u => u.trn === trn && u.password === btoa(pass));

        if (user) {
            localStorage.setItem("LoggedInUser", JSON.stringify(user));
            window.location.href = "products.html";
        } else {
            attempts--;
            document.getElementById("errorMsg").innerText = "Attempts left: " + attempts;
            if (attempts === 0) window.location.href = "locked.html";
        }
    });
}

// ==========================================
// NIKETA MUSCHETTE - PRODUCT & CART SECTION
// ==========================================

const products = [
    {
        name: "Rustic Burlap Tote",
        price: 3500,
        description: "Hand-stitched natural jute for everyday elegance.",
        image: "burlap bag.jpg" 
    },
    {
        name: "Artisan Serving Tray",
        price: 5800,
        description: "Spacious handcrafted tray with carved handles.",
        image: "large tray .jpg" 
    },
    {
        name: "Creole Accent Set",
        price: 4200,
        description: "A duo of decorative pieces for versatile styling.",
        image: "collection.jpg"
    }
];

localStorage.setItem("AllProducts", JSON.stringify(products));

function displayProducts() {
    const productGrid = document.querySelector(".product-grid");
    if (!productGrid) return;

    productGrid.innerHTML = products.map((product, index) => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='Assets/${product.image}'"> 
            <h3 class="product-title">${product.name}</h3>
            <p class="product-desc">${product.description}</p>
            <span class="product-price">$${product.price.toLocaleString()} JMD</span>
            <button class="btn buy-btn" onclick="addToCart(${index})">Add to Cart</button>
        </div>
    `).join('');
}

function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [], subtotal: 0, taxes: 0, discounts: 0, totalCost: 0 };
    const item = products[index];

    cart.items.push(item);
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price, 0);
    cart.discounts = cart.subtotal * 0.05;
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15;
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    updateCartUI(cart);
    
    // Redirecting to cart.html so user sees their bag immediately
    window.location.href = "cart.html";
}

function updateCartUI(cart) {
    const ids = ["cart-subtotal", "cart-tax", "cart-discount", "cart-total"];
    
    // FIX: Only update if the cart has items, otherwise reset to $0
    if (document.getElementById(ids[0])) {
        if (cart && cart.items.length > 0) {
            document.getElementById("cart-subtotal").innerText = "$" + cart.subtotal.toLocaleString() + ".00 JMD";
            document.getElementById("cart-tax").innerText = "$" + cart.taxes.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
            document.getElementById("cart-discount").innerText = "-$" + cart.discounts.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
            document.getElementById("cart-total").innerText = "$" + cart.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
        } else {
            ids.forEach(id => document.getElementById(id).innerText = "$0.00 JMD");
        }
    }
}

// ==========================================
// NIKETA MUSCHETTE - INVOICE SECTION
// ==========================================

function generateInvoice(event) {
    if (event) event.preventDefault(); // Prevent page reload on checkout form submit

    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (!cart || cart.items.length === 0) {
        alert("Cannot process an empty cart.");
        return;
    }

    const custName = document.getElementById("custName")?.value || "Guest User";
    const custAddress = document.getElementById("custAddress")?.value || "No Address Provided";

    // FIX: Generate invoice based on ACTUAL cart contents
    const newInvoice = {
        company: "Creole Jamaican Artistry",
        date: new Date().toLocaleDateString('en-JM'),
        invoiceNumber: "CJA-" + Date.now().toString().slice(-6), 
        trn: "123-456-789",
        shipping: { name: custName, address: custAddress },
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.taxes,
        discount: cart.discounts,
        total: cart.totalCost
    };

    let allInvoices = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    allInvoices.push(newInvoice);
    localStorage.setItem("AllInvoices", JSON.stringify(allInvoices));

    // Clear cart after checkout is finished
    localStorage.removeItem("ShoppingCart");

    alert("Success! Order confirmed.");
    window.location.href = "invoice.html";
}

function displayInvoiceData(data) {
    if (!document.getElementById("displayInvNum")) return;

    document.getElementById("displayInvNum").innerText = data.invoiceNumber;
    document.getElementById("displayDate").innerText = data.date;
    document.getElementById("displayShipName").innerText = data.shipping.name;
    document.getElementById("displayShipAddr").innerText = data.shipping.address;
    document.getElementById("displaySubtotal").innerText = "$" + data.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById("displayTax").innerText = "$" + data.tax.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById("displayGrandTotal").innerText = "$" + data.total.toLocaleString(undefined, {minimumFractionDigits: 2});

    const itemTable = document.getElementById("invoiceItemsBody");
    if (!itemTable) return;

    itemTable.innerHTML = data.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>1</td>
            <td>$${item.price.toLocaleString()}</td>
            <td>5%</td>
            <td>$${(item.price * 0.95).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
        </tr>
    `).join('');
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    const savedCart = JSON.parse(localStorage.getItem("ShoppingCart"));
    updateCartUI(savedCart);
    
    // Display latest invoice if we are on the invoice page
    let all = JSON.parse(localStorage.getItem("AllInvoices"));
    if (all && all.length > 0) {
        displayInvoiceData(all[all.length - 1]);
    }

    // Sync checkout page totals
    const checkoutTotalDisp = document.getElementById("summary-total");
    if (checkoutTotalDisp && savedCart) {
        checkoutTotalDisp.innerText = "$" + savedCart.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
    }
});

// =============================
// TREVON - DASHBOARD SECTION
// =============================

function ShowUserFrequency() {
    let users = JSON.parse(localStorage.getItem("RegistrationData")) || [];
    let genderCount = { Male: 0, Female: 0, Other: 0 };
    let ageGroups = { "18-25": 0, "26-35": 0, "36-50": 0, "50+": 0 };

    users.forEach(function(user) {
        if (user.gender && genderCount[user.gender] !== undefined) {
            genderCount[user.gender]++;
        }
        if (user.dob) {
            let dob = new Date(user.dob);
            let age = new Date().getFullYear() - dob.getFullYear();
            if (age >= 18 && age <= 25) ageGroups["18-25"]++;
            else if (age <= 35) ageGroups["26-35"]++;
            else if (age <= 50) ageGroups["36-50"]++;
            else ageGroups["50+"]++;
        }
    });

    displayChart("genderChart", genderCount);
    displayChart("ageChart", ageGroups);
}

function displayChart(id, data) {
    let container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = "";
    for (let key in data) {
        let value = data[key];
        container.innerHTML += `
            <div style="margin-bottom: 10px;">
                <p>${key}: ${value}</p>
                <div style="background: green; height: 20px; width: ${value * 40}px;"></div>
            </div>
        `;
    }
}

function ShowInvoices() {
    let invoices = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    let container = document.getElementById("invoiceList");
    if (!container) return;
    container.innerHTML = "";
    invoices.forEach(function(inv) {
        container.innerHTML += `
            <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
                <p><strong>Invoice:</strong> ${inv.invoiceNumber}</p>
                <p><strong>Customer:</strong> ${inv.shipping.name}</p>
                <p><strong>Total:</strong> $${(inv.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
        `;
    });
}

window.addEventListener("load", function () {
    if (document.getElementById("genderChart")) {
        ShowUserFrequency();
        ShowInvoices();
    }
});


