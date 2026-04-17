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
localStorage.setItem("AllProducts", JSON.stringify(products));

// --- 2. ADD TO CART (Logic for localStorage & Objects) ---
function addToCart(index) {
    // 1. Initialize the Object Structure
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { 
        items: [], 
        subtotal: 0, 
        taxes: 0, 
        discounts: 0, 
        totalCost: 0 
    };

    const product = products[index];

    // 2. Add Product Details to the 'items' array inside the object
    const existingItem = cart.items.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({ 
            id: product.id, 
            name: product.name, 
            price: product.price, 
            quantity: 1 
        });
    }

    // 3. Update Financial Details WITHIN the same Cart Object
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.discounts = cart.subtotal * 0.05; // 5% Discount
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15; // 15% GCT
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    // 4. Save the fully updated Object to localStorage
    localStorage.setItem("ShoppingCart", JSON.stringify(cart));

    // Update UI if IDs exist on the current page
    updateSummaryUI(cart);
    alert(`${product.name} added to cart! Details, Taxes, and Totals saved to object.`);
}

// --- 3. CART PAGE ACTIONS ---
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

    // Pulling product details and sub-totals directly from the Object
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
                <td><button onclick="removeItem(${index})" class="btn-remove">Remove</button></td>
            </tr>`;
    });
    updateSummaryUI(cart);
}

function updateQty(index, newQty) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (parseInt(newQty) > 0) {
        cart.items[index].quantity = parseInt(newQty);
        // This function recalculates and saves the whole object
        refreshCartObject(cart);
    }
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("ShoppingCart"));
    cart.items.splice(index, 1);
    refreshCartObject(cart);
}

function clearAll() {
    if (confirm("Clear all items?")) {
        localStorage.removeItem("ShoppingCart");
        displayCart();
        updateSummaryUI(null);
    }
}

// Helper to update the object and refresh display
function refreshCartObject(cart) {
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.discounts = cart.subtotal * 0.05; 
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15; 
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;
    
    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    displayCart();
}

// --- 4. UI UPDATER ---
function updateSummaryUI(cart) {
    const format = (val) => "$" + val.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
    if (cart) {
        if (document.getElementById("cart-subtotal")) document.getElementById("cart-subtotal").innerText = format(cart.subtotal);
        if (document.getElementById("cart-discount")) document.getElementById("cart-discount").innerText = "-" + format(cart.discounts);
        if (document.getElementById("cart-tax")) document.getElementById("cart-tax").innerText = format(cart.taxes);
        if (document.getElementById("cart-total")) document.getElementById("cart-total").innerText = format(cart.totalCost);
    } else {
        ["cart-subtotal", "cart-discount", "cart-tax", "cart-total"].forEach(id => {
            if(document.getElementById(id)) document.getElementById(id).innerText = "$0.00 JMD";
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    displayCart();
    const savedCart = JSON.parse(localStorage.getItem("ShoppingCart"));
    if (savedCart) updateSummaryUI(savedCart);
});
