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

// --- 2. ADD TO CART (Requirement: localStorage & Objects) ---
function addToCart(index) {
    // Initialize the object with all required properties
    let cart = JSON.parse(localStorage.getItem("ShoppingCart")) || { 
        items: [], 
        subtotal: 0, 
        taxes: 0, 
        discounts: 0, 
        totalCost: 0 
    };

    const selectedProduct = products[index];

    // Check if item exists to update quantity
    const existingItem = cart.items.find(item => item.id === selectedProduct.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Include product details in the items array
        cart.items.push({ 
            id: selectedProduct.id, 
            name: selectedProduct.name, 
            price: selectedProduct.price, 
            quantity: 1 
        });
    }

    // Update financial details INSIDE the object
    calculateAndSave(cart);
    alert(`${selectedProduct.name} added to bag!`);
}

// --- 3. CALCULATE AND SAVE OBJECT ---
function calculateAndSave(cart) {
    // Calculate Subtotal
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate Discount (5%)
    cart.discounts = cart.subtotal * 0.05;
    
    // Calculate Tax (15% GCT on discounted amount)
    cart.taxes = (cart.subtotal - cart.discounts) * 0.15;
    
    // Calculate Total Cost
    cart.totalCost = (cart.subtotal - cart.discounts) + cart.taxes;

    // Requirement: Save the updated object to localStorage
    localStorage.setItem("ShoppingCart", JSON.stringify(cart));
    
    // Update the UI if on the Cart page
    if (document.getElementById("cart-table-body")) displayCart();
}

// --- 4. DISPLAY CART PAGE ---
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

    // Display each item from the Object
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
        displayCart();
    }
}

// --- 5. UI UPDATER ---
function updateSummaryUI(cart) {
    const format = (num) => "$" + num.toLocaleString(undefined, {minimumFractionDigits: 2}) + " JMD";
    
    if (cart) {
        document.getElementById("cart-subtotal").innerText = format(cart.subtotal);
        document.getElementById("cart-discount").innerText = "-" + format(cart.discounts);
        document.getElementById("cart-tax").innerText = format(cart.taxes);
        document.getElementById("cart-total").innerText = format(cart.totalCost);
    } else {
        const ids = ["cart-subtotal", "cart-discount", "cart-tax", "cart-total"];
        ids.forEach(id => document.getElementById(id).innerText = "$0.00 JMD");
    }
}

// Start
document.addEventListener("DOMContentLoaded", displayCart);

