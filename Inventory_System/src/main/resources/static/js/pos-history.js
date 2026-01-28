async function loadPosSales() {
  try {
    const res = await fetch('http://localhost:8080/api/pos/history', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load sales');
    const sales = await res.json();

    const container = document.getElementById('sales-list');
    if (sales.length === 0) {
      container.innerHTML = '<p class="text-muted">No POS sales yet.</p>';
      return;
    }

    let html = `
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
    `;
    for (const order of sales) {
      const customer = order.customerName || 'Walk-in';
      const date = new Date(order.createdAt).toLocaleString();
      html += `
        <tr>
          <td>${order.orderId}</td>
          <td>${customer}</td>
          <td><button class="btn btn-sm btn-outline-secondary" onclick="viewItems(${order.orderId})">View Items</button></td>
          <td>₹${order.totalAmount.toFixed(2)}</td>
          <td>${date}</td>
        </tr>
      `;
    }
    html += `</tbody></table>`;
    container.innerHTML = html;
  } catch (e) {
    document.getElementById('sales-list').innerHTML = 
      `<div class="alert alert-danger">Error: ${e.message}</div>`;
  }
}

// Optional: View items in an order
async function viewItems(orderId) {
  const res = await fetch(`/api/orders/${orderId}/items`, { credentials: 'include' });
  const items = await res.json();
  const itemNames = items.map(i => `${i.itemName} x${i.quantity}`).join(', ');
  alert(`Items:\n${itemNames}`);
}

// Load on page load
loadPosSales();