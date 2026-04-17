/************************************************************
 * CREOLE JAMAICAN ARTISTRY - MASTER SCRIPT
 * Developer: Niketa Muschette
 ************************************************************/

// --- 1. PRODUCT CATALOGUE ---
const products = [
    { id: 101, name: "Rustic Burlap Tote", price: 3500, description: "Hand-stitched natural fiber tote.", image: "Assets/burlap bag.jpg" },
    { id: 102, name: "Artisan Serving Tray", price: 5800, description: "Cedar wood tray with Jamaican patterns.", image: "Assets/large tray .jpg" },
    { id: 103, name: "Creole Accent Set", price: 4200, description: "Coasters and matching vase set.", image: "Assets/collection.jpg" }
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

// --- 3. SHOPPING CART LOGIC (localStorage & Objects) ---
function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { 
        items: [], 
        subtotal: 0, 
        taxes: 0, 
        discounts: 0, 
        totalCost: 0 
    };
    
    const selectedProduct = products[index];
    
    // Check if product already in cart to update quantity
    const existingItem = cart.items.find(item => item.id === selectedProduct.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Add product details + quantity property
        cart.items.push({ 
            id: selectedProduct.id, 
            name: selectedProduct.name, 
            price: selectedProduct.price, 
            quantity: 1 
        });
    }
    
    calculateCartTotals(cart);
    alert(`${selectedProduct.name} added to bag!`);
}

function calculateCartTotals(cart) {
    // 1. Subtotal (Price * Quantity)
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 2. Discount (5% Creole Discount)
    cart.discounts = cart.subtotal * 0.05; 
    
    // 3. GCT (15% Tax on discounted subtotal)
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15; 
    
    // 4. Final Total
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    // Requirement: Update localStorage object
    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    updateSummaryUI(cart);
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
        const lineTotal = item.price * item.quantity;
        tableBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>$${item.price.toLocaleString()}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="updateQty(${index}, this.value)" style="width:50px;">
                </td>
                <td>$${lineTotal.toLocaleString()}</td>
                <td><button onclick="removeItem(${index})" class="btn-remove">Remove</button></td>
            </tr>`;
    });
    updateSummaryUI(cart);
}

// Requirement: Update Quantities
function updateQty(index, newQty) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    const qty = parseInt(newQty);
    if (qty > 0) {
        cart.items[index].quantity = qty;
        calculateCartTotals(cart);
        displayCart();
    }
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    cart.items.splice(index, 1);
    calculateCartTotals(cart);
    displayCart();
}

function clearAll() {
    if (confirm("Clear all items from your shopping cart?")) {
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
    if (!cart || cart.items.length === 0) return alert("Nothing to checkout!");

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
