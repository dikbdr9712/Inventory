document.addEventListener('DOMContentLoaded', function () {
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
                <img src="${item.image}" alt="${item.name}" style="height:60px; width:auto; margin-right:10px;">
                <div class="cart-item-details" style="flex:1;">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Nu. ${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <input type="number" value="${item.quantity}" min="1" style="width:50px; text-align:center;" onchange="updateQuantity(${item.id}, parseInt(this.value) - ${item.quantity})">
                        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-total">Nu. ${itemTotal.toFixed(2)}</div>
            </div>
        `;
    }).join('');

    totalAmountElement.textContent = total.toFixed(2);

    // Re-attach event listener safely
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.onclick = placeOrder;
    }
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
        loadCart();
    }
}

async function placeOrder() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        localStorage.setItem('redirectAfterLogin', 'cart.html');
        alert("Please log in to place an order.");
        window.location.href = 'login.html';
        return;
    }

    const customerEmail = localStorage.getItem('currentUser'); // email
    const customerName = localStorage.getItem('userName');
    if (!customerEmail || !customerName) {
        alert("User profile incomplete. Please log in again.");
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let totalAmount = 0;
    const orderItems = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        return {
            itemId: item.id,
            quantity: item.quantity,
            price: item.price
        };
    });

    const orderData = {
        customerEmail: customerEmail,
        customerName: customerName,
        totalAmount: totalAmount,
        items: orderItems
    };

    try {
        // Step 1: Create order with status = "Created"
        const response = await fetch('http://localhost:8080/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const order = await response.json();
            const orderId = order.orderId;

            // ✅ Redirect to payment page with order ID and total
            window.location.href = `payment.html?orderId=${orderId}&total=${totalAmount}`;
        } else {
            const errorText = await response.text();
            console.error('Order creation failed:', errorText);
            alert('❌ Failed to create order. Please try again.');
        }
    } catch (err) {
        console.error('Network error:', err);
        alert('🌐 Could not connect to server. Is Spring Boot running on port 8080?');
    }
}