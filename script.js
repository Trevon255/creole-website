/************************************************************
 * CREOLE JAMAICAN ARTISTRY - MASTER SCRIPT
 * Developer: Niketa Muschette
 ************************************************************/

// --- 1. PRODUCT CATALOGUE (Arrays & Objects) ---
const products = [
    { 
        name: "Rustic Burlap Tote", 
        price: 3500, 
        description: "Hand-stitched natural fiber tote with reinforced handles.", 
        image: "Assets/burlap bag.jpg" 
    },
    { 
        name: "Artisan Serving Tray", 
        price: 5800, 
        description: "Cedar wood tray with hand-painted Jamaican patterns.", 
        image: "Assets/large tray .jpg" 
    },
    { 
        name: "Creole Accent Set", 
        price: 4200, 
        description: "A collection of 3 ceramic coasters and a matching vase.", 
        image: "Assets/collection.jpg" 
    }
];

// Requirement: Keep updated list on localStorage as AllProducts
localStorage.setItem("AllProducts", JSON.stringify(products));

// --- 2. DYNAMIC PRODUCT DISPLAY ---
function displayProducts() {
    const productGrid = document.querySelector(".product-grid");
    if (!productGrid) return;

    const catalogue = JSON.parse(localStorage.getItem("AllProducts"));
    productGrid.innerHTML = catalogue.map((product, index) => `
        <div class="product-card">
            <img src="${product.image}" class="product-image" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="description">${product.description}</p>
            <p class="product-price">$${product.price.toLocaleString()} JMD</p>
            <button type="button" class="btn" onclick="addToCart(${index})">Add to Cart</button>
        </div>
    `).join('');
}

// --- 3. SHOPPING CART LOGIC ---
function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { items: [], subtotal: 0, taxes: 0, discounts: 0, totalCost: 0 };
    
    // Add product details
    cart.items.push(products[index]);
    
    // Requirement: Calculations (Subtotal, 5% Discount, 15% GCT)
    calculateCartTotals(cart);
}

function calculateCartTotals(cart) {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
    cart.discounts = cart.subtotal * 0.05; 
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15; 
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    updateSummaryUI(cart);
    alert("Item added to bag!");
}

// --- 4. CART PAGE ACTIONS ---
function displayCart() {
    const tableBody = document.getElementById("cart-table-body");
    if (!tableBody) return;

    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    tableBody.innerHTML = "";

    if (!cart || cart.items.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Your bag is empty.</td></tr>";
        updateSummaryUI(null);
        return;
    }

    cart.items.forEach((item, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>$${item.price.toLocaleString()}</td>
                <td>1</td>
                <td>$${item.price.toLocaleString()}</td>
                <td><button onclick="removeItem(${index})" class="btn-remove">Remove</button></td>
            </tr>`;
    });
    updateSummaryUI(cart);
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    cart.items.splice(index, 1);
    calculateCartTotals(cart);
    displayCart();
}

// Requirement: Clear All Button Logic
function clearAll() {
    if (confirm("Are you sure you want to remove all items from your shopping cart?")) {
        localStorage.removeItem("ShoppingCart");
        displayCart();
        updateSummaryUI(null);
    }
}

// --- 5. UI UPDATES ---
function updateSummaryUI(cart) {
    const ids = ["cart-subtotal", "cart-discount", "cart-tax", "cart-total", "summary-total"];
    if (cart) {
        const format = (val) => "$" + val.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
        if (document.getElementById("cart-subtotal")) document.getElementById("cart-subtotal").innerText = format(cart.subtotal);
        if (document.getElementById("cart-discount")) document.getElementById("cart-discount").innerText = "-" + format(cart.discounts);
        if (document.getElementById("cart-tax")) document.getElementById("cart-tax").innerText = format(cart.taxes);
        if (document.getElementById("cart-total")) document.getElementById("cart-total").innerText = format(cart.totalCost);
        if (document.getElementById("summary-total")) document.getElementById("summary-total").innerText = format(cart.totalCost);
    } else {
        ids.forEach(id => { if(document.getElementById(id)) document.getElementById(id).innerText = "$0.00 JMD"; });
    }
}

// --- 6. CHECKOUT ---
function confirmCheckout(event) {
    event.preventDefault();
    const cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (!cart) return alert("Nothing to checkout!");

    const invoice = {
        invoiceNo: "CJA-" + Math.floor(Math.random() * 900000 + 100000),
        name: document.getElementById("custName").value,
        address: document.getElementById("custAddress").value,
        paid: document.getElementById("amountPaid").value,
        total: cart.totalCost,
        date: new Date().toLocaleString()
    };

    localStorage.setItem("FinalInvoice", JSON.stringify(invoice));
    localStorage.removeItem("ShoppingCart");
    window.location.href = "invoice.html";
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    displayCart();
    const savedCart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (savedCart) updateSummaryUI(savedCart);
});
