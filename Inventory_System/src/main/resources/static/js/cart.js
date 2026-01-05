// cart.js

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
});

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const totalAmountElement = document.getElementById('total-amount');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        totalAmountElement.textContent = '0.00';
        return;
    }

    let total = 0;

    cartItemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        return `
            <div class="cart-item" data-item-id="${item.id}" data-item-price="${item.price}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Nu. ${item.price}</div>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, parseInt(this.value) - ${item.quantity})">
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-total">Nu. ${itemTotal.toFixed(2)}</div>
            </div>
        `;
    }).join('');

    totalAmountElement.textContent = total.toFixed(2);

    // Attach place order button (only once)
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
}

function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart(); // Refresh cart
    }
}

async function placeOrder() {
    // 1. Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        localStorage.setItem('redirectAfterLogin', 'cart.html');
        alert("Please log in to place an order.");
        window.location.href = 'login.html';
        return;
    }

    // 2. Get user info
    const customerEmail = localStorage.getItem('currentUser'); // assuming you store email as 'currentUser'
    const customerName = localStorage.getItem('userName');

    if (!customerEmail || !customerName) {
        alert("User profile is incomplete. Please log in again.");
        return;
    }

    // 3. Read cart items from DOM (using data attributes)
    const cartItemElements = document.querySelectorAll('.cart-item');
    const orderItems = [];
    let totalAmount = 0;

    cartItemElements.forEach(el => {
        const itemId = parseInt(el.dataset.itemId);
        const price = parseFloat(el.dataset.itemPrice);
        const quantityInput = el.querySelector('input[type="number"]');
        const quantity = parseInt(quantityInput?.value) || 0;

        if (quantity > 0 && !isNaN(itemId) && !isNaN(price)) {
            const itemTotal = price * quantity;
            totalAmount += itemTotal;
            orderItems.push({
                itemId: itemId,
                quantity: quantity,
                price: price
            });
        }
    });

    if (orderItems.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // 4. Prepare order payload
    const orderData = {
        customerEmail: customerEmail,
        customerName: customerName,
        totalAmount: totalAmount,
        items: orderItems
    };

    // 5. Send to Spring Boot
    try {
        const response = await fetch('http://localhost:8080/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const order = await response.json();
            alert(`✅ Order placed successfully!\nOrder ID: ${order.orderId}`);
            localStorage.removeItem('cart');
            window.location.href = 'Product.html'; // or order-confirmation.html
        } else {
            const errorText = await response.text();
            console.error('Order error response:', errorText);
            alert('❌ Failed to place order. Please try again.');
        }
    } catch (err) {
        console.error('Network error:', err);
        alert('🌐 Could not connect to server. Is your Spring Boot app running on port 8080?');
    }
}