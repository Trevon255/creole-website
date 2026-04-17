
```javascript
/************************************************************
AUTHENTICATION & SECURITY
Student Name: Niketa Muschette
Description: Handles registration, login, lockout,
TRN validation, password reset, and localStorage.
************************************************************/

/***********************
UTILITY FUNCTIONS
************************/

// Calculate Age from Date of Birth
function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Get users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem("RegistrationData")) || [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem("RegistrationData", JSON.stringify(users));
}

/************************************************************
QUESTION 1 – USER AUTHENTICATION
************************************************************/

const registrationForm = document.getElementById("registrationForm");

if (registrationForm) {
    registrationForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const dob = document.getElementById("dob").value;
        const gender = document.getElementById("gender").value;
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const trn = document.getElementById("trn").value.trim();
        const password = document.getElementById("password").value;

        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        if (calculateAge(dob) < 18) {
            alert("You must be 18 years or older to register.");
            return;
        }

        const trnPattern = /^\d{3}-\d{3}-\d{3}$/;
        if (!trnPattern.test(trn)) {
            alert("TRN must be in format 000-000-000");
            return;
        }

        let users = getUsers();
        const trnExists = users.some(user => user.trn === trn);
        if (trnExists) {
            alert("TRN already registered. Please login.");
            return;
        }

        const newUser = {
            firstName, lastName, dob, gender, phone, email, trn,
            password: btoa(password),
            dateOfRegistration: new Date().toLocaleDateString(),
            invoices: []
        };

        users.push(newUser);
        saveUsers(users);
        alert("Registration successful! Redirecting to login...");
        window.location.href = "login.html";
    });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    let attempts = 3;
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const enteredTrn = document.getElementById("loginTrn").value.trim();
        const enteredPassword = document.getElementById("loginPassword").value;
        const errorMsg = document.getElementById("errorMsg");

        let users = getUsers();
        const user = users.find(u => u.trn === enteredTrn && u.password === btoa(enteredPassword));

        if (user) {
            localStorage.setItem("LoggedInUser", JSON.stringify(user));
            alert("Login successful!");
            window.location.href = "products.html"; // Redirect to catalogue
        } else {
            attempts--;
            errorMsg.innerText = "Invalid TRN or Password. Attempts left: " + attempts;
            if (attempts === 0) window.location.href = "locked.html";
        }
    });
}

function resetPassword() {
    let trn = prompt("Enter your TRN (000-000-000):");
    if (!trn) return;
    let users = getUsers();
    let user = users.find(u => u.trn === trn);
    if (!user) { alert("TRN not found."); return; }

    let newPassword = prompt("Enter new password (minimum 8 characters):");
    if (!newPassword || newPassword.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
    }
    user.password = btoa(newPassword);
    saveUsers(users);
    alert("Password successfully updated!");
}

/************************************************************
QUESTION 2 – PRODUCT CATALOGUE (localStorage & Objects)
Student Name: Niketa Muschette
************************************************************/

const products = [
    {
        name: "Rustic Burlap Tote",
        price: 3500,
        description: "Hand-stitched natural jute for everyday elegance.",
        image: "Assets/burlap%20bag.jpg"
    },
    {
        name: "Artisan Serving Tray",
        price: 5800,
        description: "Spacious handcrafted tray with carved handles.",
        image: "Assets/large%20tray%20.jpg"
    },
    {
        name: "Creole Accent Set",
        price: 4200,
        description: "A duo of decorative pieces for versatile styling.",
        image: "Assets/collection.jpg"
    }
];

// Save updated master list
localStorage.setItem("AllProducts", JSON.stringify(products));

function displayProducts() {
    const productGrid = document.querySelector(".product-grid");
    if (!productGrid) return;

    const allProducts = JSON.parse(localStorage.getItem("AllProducts"));
    productGrid.innerHTML = "";

    allProducts.forEach((product, index) => {
        productGrid.innerHTML += `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <span class="product-price">$${product.price.toLocaleString()} JMD</span>
                <button class="btn buy-btn" onclick="addToCart(${index})">Add to Cart</button>
            </div>
        `;
    });
}

/************************************************************
QUESTION 3 – SHOPPING CART (localStorage and Objects)
Student Name: Niketa Muschette
************************************************************/

function addToCart(index) {
    const allProducts = JSON.parse(localStorage.getItem("AllProducts"));
    const selectedProduct = allProducts[index];
    const TAX_RATE = 0.15;
    const DISCOUNT_RATE = 0.05;

    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || {
        items: [], subtotal: 0, taxes: 0, discounts: 0, totalCost: 0
    };

    cart.items.push(selectedProduct);

    // Calculations
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
    cart.discounts = cart.subtotal * DISCOUNT_RATE;
    cart.taxes = (cart.subtotal - cart.discounts) * TAX_RATE;
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    localStorage.setItem("ShoppingCart", JSON.stringify(cart));

    // Update UI Summary on products.html if elements exist
    if(document.getElementById("cart-subtotal")){
        document.getElementById("cart-subtotal").innerText = "$" + cart.subtotal.toLocaleString() + " JMD";
        document.getElementById("cart-tax").innerText = "$" + cart.taxes.toLocaleString() + " JMD";
        document.getElementById("cart-discount").innerText = "$" + cart.discounts.toLocaleString() + " JMD";
        document.getElementById("cart-total").innerText = "$" + Math.round(cart.totalCost).toLocaleString() + " JMD";
    }

    alert(`${selectedProduct.name} added to cart!`);
}

/************************************************************
QUESTION – CHECKOUT & INVOICE
Student Name: Niketa Muschette
************************************************************/

function confirmOrder(event) {
    if(event) event.preventDefault();

    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (!cart || cart.items.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const name = document.getElementById("custName")?.value || "Valued Customer";
    const address = document.getElementById("custAddress")?.value || "Digital Delivery";

    const newInvoice = {
        companyName: "Creole Jamaican Artistry",
        date: new Date().toLocaleDateString('en-JM'),
        invoiceNumber: "CJA-" + Date.now().toString().slice(-6),
        trn: "123-456-789",
        shippingInfo: { name: name, address: address },
        items: cart.items,
        subtotal: cart.subtotal,
        taxes: cart.taxes,
        discounts: cart.discounts,
        totalCost: cart.totalCost
    };

    // Store Invoice
    let allInvoices = JSON.parse(localStorage.getItem("AllInvoices")) || [];
    allInvoices.push(newInvoice);
    localStorage.setItem("AllInvoices", JSON.stringify(allInvoices));

    // Clear Cart after order
    localStorage.removeItem("ShoppingCart");

    alert(`Success! Order ${newInvoice.invoiceNumber} confirmed.\nA copy has been sent to your email.`);
    window.location.href = "invoice.html";
}

function displayInvoiceData() {
    const all = JSON.parse(localStorage.getItem("AllInvoices"));
    if (!all || all.length === 0 || !document.getElementById("invNum")) return;

    const data = all[all.length - 1]; // Get latest invoice

    document.getElementById("invNum").innerText = data.invoiceNumber;
    document.getElementById("invDate").innerText = data.date;
    document.getElementById("shipName").innerText = data.shippingInfo.name;
    document.getElementById("shipAddress").innerText = data.shippingInfo.address;
    document.getElementById("subTotal").innerText = "$" + data.subtotal.toLocaleString();
    document.getElementById("taxAmount").innerText = "$" + data.taxes.toLocaleString();
    document.getElementById("grandTotal").innerText = "$" + data.totalCost.toLocaleString();

    const itemTable = document.getElementById("invoiceItems");
    if(itemTable) {
        itemTable.innerHTML = data.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>1</td>
                <td>$${item.price.toLocaleString()}</td>
                <td>5%</td>
                <td>$${(item.price * 0.95).toLocaleString()}</td>
            </tr>
        `).join('');
    }
}

function cancelOrder() {
    if(confirm("Return to your cart?")) {
        window.location.href = "products.html";
    }
}

// Auto-init for different pages
document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    displayInvoiceData();
});
```
