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

// --- 2. DYNAMIC PRODUCT DISPLAY ---
function displayProducts() {
    const grid = document.querySelector(".product-grid");
    if (!grid) return;

    grid.innerHTML = products.map((p, index) => `
        <div class="product-card">
            <img src="${p.image}" class="product-image" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <span class="product-price">$${p.price.toLocaleString()} JMD</span>
            <button onclick="addToCart(${index})" class="btn">Add to Cart</button>
        </div>
    `).join('');
}

// --- 3. ADD TO CART (Object Requirement) ---
function addToCart(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { 
        items: [], subtotal: 0, taxes: 0, discounts: 0, totalCost: 0 
    };

    const selectedProduct = products[index];
    const existing = cart.items.find(item => item.id === selectedProduct.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.items.push({ 
            id: selectedProduct.id, 
            name: selectedProduct.name, 
            price: selectedProduct.price, 
            quantity: 1 
        });
    }

    calculateAndSave(cart);
    alert(`${selectedProduct.name} added to your Bag!`);
}

// --- 4. CALCULATIONS & SAVING ---
function calculateAndSave(cart) {
    // 1. Subtotal
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // 2. Discount (5%)
    cart.discounts = cart.subtotal * 0.05; 
    // 3. GCT (15% after discount)
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15; 
    // 4. Final Total
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    updateSummaryUI(cart);
    if (document.getElementById("cart-table-body")) displayCart();
}

// --- 5. DISPLAY CART PAGE (cart.html) ---
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
                <td>
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="updateQty(${index}, this.value)" style="width:50px;">
                </td>
                <td>$${(item.price * item.quantity).toLocaleString()}</td>
                <td><button onclick="removeItem(${index})" style="color:red; border:none; background:none; cursor:pointer;">Remove</button></td>
            </tr>`;
    });
    updateSummaryUI(cart);
}

function updateQty(index, newQty) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (parseInt(newQty) > 0) {
        cart.items[index].quantity = parseInt(newQty);
        calculateAndSave(cart);
    }
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    cart.items.splice(index, 1);
    calculateAndSave(cart);
}

function clearAll() {
    if (confirm("Remove all items from your bag?")) {
        localStorage.removeItem("ShoppingCart");
        location.reload();
    }
}

// --- 6. UI UPDATER (Syncs both pages) ---
function updateSummaryUI(cart) {
    const fmt = (val) => "$" + (val || 0).toLocaleString(undefined, {minimumFractionDigits: 2});
    
    const fields = {
        "cart-subtotal": cart?.subtotal,
        "cart-discount": cart?.discounts ? -cart.discounts : 0,
        "cart-tax": cart?.taxes,
        "cart-total": cart?.totalCost
    };

    for (let id in fields) {
        let el = document.getElementById(id);
        if (el) el.innerText = fmt(fields[id]) + " JMD";
    }
}

// --- 7. INITIALIZE ---
document.addEventListener("DOMContentLoaded", () => {
    displayProducts();
    displayCart();
    const saved = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (saved) updateSummaryUI(saved);
});
