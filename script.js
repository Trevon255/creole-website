

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

// --- QUESTION 2: PRODUCT CATALOGUE ---
// NOTE: I am using the exact filenames from your screenshots.
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

// --- QUESTION 3: SHOPPING CART ---
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
    alert(item.name + " added!");
}

function updateCartUI(cart) {
    const ids = ["cart-subtotal", "cart-tax", "cart-discount", "cart-total"];
    if (document.getElementById(ids[0])) {
        document.getElementById("cart-subtotal").innerText = "$" + cart.subtotal.toLocaleString() + " JMD";
        document.getElementById("cart-tax").innerText = "$" + Math.round(cart.taxes).toLocaleString() + " JMD";
        document.getElementById("cart-discount").innerText = "-$" + Math.round(cart.discounts).toLocaleString() + " JMD";
        document.getElementById("cart-total").innerText = "$" + Math.round(cart.totalCost).toLocaleString() + " JMD";
    }
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    const savedCart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (savedCart) updateCartUI(savedCart);
});

//-------CHECKOUT-------




// ------INVOICE------
// 1. Initial Data & User Object
let currentUser = {
    username: "Customer",
    invoices: [] // Array of invoice objects
};

// 2. Function to execute when Order is Confirmed (Triggered from Checkout)
function generateInvoice() {
    // Capture data from checkout form
    const custName = document.getElementById("custName")?.value || "Guest User";
    const custAddress = document.getElementById("custAddress")?.value || "No Address Provided";

    // Create unique invoice object
    const newInvoice = {
        company: "Creole Jamaican Artistry",
        date: new Date().toLocaleDateString('en-JM'),
        invoiceNumber: "CJA-" + Date.now().toString().slice(-6), // Unique 6-digit ID
        trn: "123-456-789",
        shipping: { name: custName, address: custAddress },
        items: [
            { name: "Rustic Burlap Tote", qty: 1, price: 3500.00, discount: "5%" },
            { name: "Artisan Serving Tray", qty: 1, price: 5800.00, discount: "5%" }
        ],
        subtotal: 9300.00,
        tax: 1325.25,
        total: 10160.25
    };

    // 3. Update User Object & LocalStorage
    currentUser.invoices.push(newInvoice);
    
    let allInvoices = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    allInvoices.push(newInvoice);
    localStorage.setItem("AllInvoices", JSON.stringify(allInvoices));

    // 4. Populate HTML (if on invoice page)
    displayInvoiceData(newInvoice);

    // 5. Notify User
    console.log("Invoice emailed to: user@example.com");
}

function displayInvoiceData(data) {
    if (!document.getElementById("invNum")) return;

    document.getElementById("invNum").innerText = data.invoiceNumber;
    document.getElementById("invDate").innerText = data.date;
    document.getElementById("shipName").innerText = data.shipping.name;
    document.getElementById("shipAddress").innerText = data.shipping.address;
    document.getElementById("subTotal").innerText = "$" + data.subtotal.toLocaleString();
    document.getElementById("taxAmount").innerText = "$" + data.tax.toLocaleString();
    document.getElementById("grandTotal").innerText = "$" + data.total.toLocaleString();

    const itemTable = document.getElementById("invoiceItems");
    itemTable.innerHTML = data.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>$${item.price.toLocaleString()}</td>
            <td>${item.discount}</td>
            <td>$${(item.price * 0.95).toLocaleString()}</td>
        </tr>
    `).join('');
}

// Auto-run if elements exist (simulating landing on the page)
window.onload = () => {
    // In a real app, you'd pull the LATEST invoice from localStorage to display
    let all = JSON.parse(localStorage.getItem("AllInvoices"));
    if (all && all.length > 0) {
        displayInvoiceData(all[all.length - 1]);
    }
};
