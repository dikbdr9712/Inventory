document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (!orderId) {
        document.getElementById('order-detail-container').innerHTML = '<p>Invalid order ID.</p>';
        return;
    }

    try {
        // Fetch order details
        const orderResponse = await fetch(`http://localhost:8080/api/orders/${orderId}`);
        if (!orderResponse.ok) throw new Error('Failed to fetch order');
        const order = await orderResponse.json();

        // Fetch order items
        const itemsResponse = await fetch(`http://localhost:8080/api/orders/${orderId}/items`);
        if (!itemsResponse.ok) throw new Error('Failed to fetch items');
        const items = await itemsResponse.json();

        renderOrderDetails(order, items);

    } catch (err) {
        console.error('Error loading order:', err);
        document.getElementById('order-detail-container').innerHTML = `
            <div class="alert alert-danger">
                Error loading order details. Please try again.
            </div>
        `;
    }
});

function renderOrderDetails(order, items) {
    const container = document.getElementById('order-detail-container');
    
    const itemsHtml = items.map(item => {
        const baseUrl = 'http://localhost:8080';
        const imgSrc = item.imagePath ? `${baseUrl}${item.imagePath}` : 'https://via.placeholder.com/50?text=No+Image';
        const name = item.itemName || 'Unknown Item';
        const qty = item.quantity || 0;
        const unitPrice = item.unitPrice || 0;
        const total = (unitPrice * qty).toFixed(2);
        const uom = item.uom || '';

        return `
            <div class="item-row">
                <img src="${imgSrc}" alt="${name}" class="item-image">
                <div>
                    <strong>${name}</strong> × ${qty} ${uom} — Nu. ${total}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="order-detail-card">
        <div class="d-flex justify-content-between">
                        <h5><b>Order id: </b> #${order.orderId}</h5>
                        <span class="order-status ${getStatusClass(order.orderStatus)}"><b>Status: </b>${order.orderStatus}</span>
                    </div>
            <h3></h3>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Total Amount:</strong> Nu. ${Number(order.totalAmount).toFixed(2)}</p>
            <hr>
            <h5>Items:</h5>
            ${itemsHtml || '<p>No items found</p>'}
            <hr>
            <a href="orders.html" class="btn btn-secondary">Back to Orders</a>
        </div>
    `;
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