document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = localStorage.getItem('currentUser');

    if (!isLoggedIn || !userEmail) {
        alert("Please log in to view your orders.");
        window.location.href = 'login.html';
        return;
    }

    loadOrders(userEmail);
});

async function loadOrders(email) {
    const container = document.getElementById('orders-container');
    container.innerHTML = '<p>Loading your orders...</p>';

    try {
        // 1. Fetch orders
        const ordersResponse = await fetch(`http://localhost:8080/api/orders/customer/${encodeURIComponent(email)}`);
        if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
        const orders = await ordersResponse.json();

        if (orders.length === 0) {
            container.innerHTML = '<p>You have no orders yet.</p>';
            return;
        }

        // 2. Fetch items for ALL orders in parallel
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                try {
                    const itemsResponse = await fetch(`http://localhost:8080/api/orders/${order.orderId}/items`);
                    const items = await itemsResponse.json();
                    return { ...order, items };
                } catch (err) {
                    console.warn(`Failed to load items for order ${order.orderId}`, err);
                    return { ...order, items: [] };
                }
            })
        );

        // 3. Render all at once
        container.innerHTML = ordersWithItems.map(order => {
            const itemsHtml = order.items.map(item => {
                const baseUrl = 'http://localhost:8080';
                const imgSrc = item.imagePath ? `${baseUrl}${item.imagePath}` : 'https://via.placeholder.com/30?text=No+Image';
                const name = item.itemName || 'Unknown Item';
                const qty = item.quantity || 0;
                const unitPrice = item.unitPrice || 0;
                const total = (unitPrice * qty).toFixed(2);

               
            }).join('');

            return `
                <div class="order-card" style="border:1px solid #ddd;padding:15px;margin-bottom:20px;border-radius:8px;">
                    <h5>Order #${order.orderId}</h5>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                    <p><strong>Total Amount:</strong> Nu. ${Number(order.totalAmount).toFixed(2)}</p>
                    <div class="mt-3">
                        <a href="order-details.html?orderId=${order.orderId}" class="btn btn-sm btn-outline-primary">View Details</a>
                        ${order.orderStatus === 'PENDING' ? 
                          `<button onclick="cancelOrder(${order.orderId})" class="btn btn-sm btn-outline-danger ml-2">Cancel Order</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('Error loading orders:', err);
        container.innerHTML = '<p>Error loading orders. Please try again later.</p>';
    }
}

function getStatusClass(status) {
    switch(status) {
        case 'PENDING': return 'status-pending';
        case 'CONFIRMED': return 'status-confirmed';
        case 'COMPLETED': return 'status-completed';
        case 'CANCELLED': return 'status-cancelled';
        default: return 'status-pending';
    }
}

async function getOrderItemsHtml(orderId) {
    try {
        const response = await fetch(`http://localhost:8080/api/orders/${orderId}/items`);
        const items = await response.json();

        if (!Array.isArray(items)) {
            return '<li>Could not load items</li>';
        }

        return items.map(item => {
            const name = item.itemName || 'Unknown Item';
            const qty = item.quantity || 0;
            const price = item.unitPrice || 0;
            const total = (price * qty).toFixed(2);

            return `<li>${name} x ${qty} - Nu. ${total}</li>`;
        }).join('');
    } catch {
        return '<li>Could not load items</li>';
    }
}

async function cancelOrder(orderId) {
    if (!confirm("Are you sure you want to cancel this order?")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
            method: 'POST'
        });

        if (response.ok) {
            alert("Order cancelled successfully!");
            loadOrders(localStorage.getItem('currentUser'));
        } else {
            alert("Failed to cancel order. Please try again.");
        }
    } catch (err) {
        console.error('Error cancelling order:', err);
        alert("Network error. Is the server running?");
    }
}