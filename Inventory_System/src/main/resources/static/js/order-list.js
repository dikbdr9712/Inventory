// js/order-list.js

let allOrders = []; // Store raw data
let currentFilter = 'needs-action'; // Default view

// Utility: format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

// Determine if an order needs action
function needsAction(order) {
  const status = order.orderStatus;
  const payment = order.paymentStatus;

  // Needs action if:
  // - Payment is pending
  // - Paid but not confirmed (CREATED)
  // - Confirmed but not shipped
  // - Shipped but not completed
  // - Any unknown/undefined state

  if (payment === 'PENDING') return true;
  if (payment === 'PAID' && status === 'CREATED') return true;
  if (status === 'CONFIRMED') return true;
  if (status === 'SHIPPED') return true;
  if (!status || status === 'UNKNOWN' || status === 'PENDING') return true;

  // COMPLETED, CANCELLED → no action needed
  return false;
}

// Fetch and store orders
async function loadOrders() {
  try {
    const res = await fetch('http://localhost:8080/api/admin/orders', { credentials: 'include' });
    
    if (res.status === 403) {
      alert('Access denied: You must be ADMIN, MANAGER, or CONTROLLER to view orders.');
      window.location.href = 'login.html';
      return;
    }
    if (!res.ok) throw new Error('Failed to load orders');

    allOrders = await res.json();
    const needsActionCount = allOrders.filter(needsAction).length;
    const totalCount = allOrders.length;
    const needsBtn = document.getElementById('btn-needs-action');
    const allBtn = document.getElementById('btn-all-orders');

    needsBtn.textContent = `Needs Action (${needsActionCount})`;
    allBtn.textContent = `All Orders (${totalCount})`;

    applyFilter(); // Render based on current filter
  } catch (error) {
    console.error('Load orders error:', error);
    document.getElementById('orders-container').innerHTML = 
      '<div class="alert alert-danger">Failed to load orders</div>';
  }
}

// Apply current filter and render
function applyFilter() {
  let filteredOrders = [];
  
  if (currentFilter === 'needs-action') {
    filteredOrders = allOrders.filter(needsAction);
  } else {
    filteredOrders = [...allOrders];
  }

  renderOrders(filteredOrders);
}

function renderOrders(orders) {
  const container = document.getElementById('orders-container');
  
  if (!orders || orders.length === 0) {
    container.innerHTML = currentFilter === 'needs-action'
      ? '<p class="text-muted">No orders need your attention right now.</p>'
      : '<p class="text-muted">No orders yet.</p>';
    return;
  }

  const html = orders.map(order => `
    <div class="card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div>
          <strong>Order #${order.orderId}</strong> — 
          ${order.customerName || 'Unknown'} (${order.customerEmail || 'No email'})
          <br>
          <small>
            Payment: <span class="badge bg-${order.paymentStatus === 'PAID' ? 'success' : 'warning'}">${order.paymentStatus}</span>
          </small>
        </div>
        <span class="badge ${getBadgeClass(order.orderStatus)}">${order.orderStatus || 'UNKNOWN'}</span>
      </div>
      <div class="card-body">
        <p><small>Created: ${order.createdAt ? formatDate(order.createdAt) : 'Unknown'}</small></p>
        
        <table class="table table-sm">
          <thead><tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Total</th>
          </tr></thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td>${item.itemName || 'Deleted Item'} ${item.uom ? '(' + item.uom + ')' : ''}</td>
                <td>${item.quantityOrdered || 0}</td>
                <td>
                  <span class="${(item.stockAvailable >= item.quantityOrdered) ? 'stock-ok' : 'stock-low'}">
                    ${item.stockAvailable || 0}
                  </span>
                  ${item.stockAvailable < item.quantityOrdered ? ' ❗' : ''}
                </td>
                <td>₹${(item.unitPrice || 0).toFixed(2)}</td>
                <td>₹${((item.unitPrice || 0) * (item.quantityOrdered || 0)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="d-flex justify-content-end mt-3">
          ${getActionButtons(order)}
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

function getBadgeClass(status) {
  switch (status) {
    case 'PENDING': return 'bg-warning text-dark';
    case 'CREATED': return 'bg-secondary'; // or bg-light text-dark
    case 'CONFIRMED': return 'bg-info text-dark';
    case 'SHIPPED': return 'bg-primary';
    case 'COMPLETED': return 'bg-success';
    case 'CANCELLED': return 'bg-secondary';
    default: return 'bg-danger';
  }
}

function getActionButtons(order) {
  let buttons = '';

  if (order.paymentStatus === 'PENDING') {
    buttons += `<button class="btn btn-warning btn-sm me-2" onclick="confirmPayment(${order.orderId})">Confirm Payment</button>`;
  }
  else if (order.paymentStatus === 'PAID' && order.orderStatus === 'CREATED') {
    const allInStock = order.items.every(item => item.stockAvailable >= item.quantityOrdered);
    if (allInStock) {
      buttons += `<button class="btn btn-success btn-sm me-2" onclick="confirmOrder(${order.orderId})">Confirm Order</button>`;
    } else {
      buttons += `
        <button class="btn btn-danger btn-sm me-2" disabled>❌ Insufficient Stock</button>
        <button class="btn btn-outline-secondary btn-sm" onclick="handlePartialOrder(${order.orderId})">Resolve Partial</button>`;
    }
  }
  else if (order.orderStatus === 'CONFIRMED') {
    buttons += `<button class="btn btn-info btn-sm me-2" onclick="shipOrder(${order.orderId})">Ship Order</button>`;
  }
  else if (order.orderStatus === 'SHIPPED') {
    buttons += `<button class="btn btn-primary btn-sm" onclick="completeOrder(${order.orderId})">Mark Delivered</button>`;
  }

  return buttons;
}

// === ACTION HANDLERS (unchanged) ===
async function confirmPayment(orderId) {
  if (!confirm('Confirm payment received for this order?')) return;
  await performOrderAction(orderId, 'confirm-payment');
}
async function handlePartialOrder(orderId) {
  alert('Partial fulfillment: Cancel out-of-stock items or backorder?');
}
async function confirmOrder(orderId) {
  if (!confirm('Confirm this order? Stock will be deducted.')) return;
  await performOrderAction(orderId, 'confirm');
}
async function cancelOrder(orderId) {
  if (!confirm('Cancel this order?')) return;
  await performOrderAction(orderId, 'cancel');
}
async function shipOrder(orderId) {
  if (!confirm('Assign shipment ID and mark as shipped?')) return;
  await performOrderAction(orderId, 'ship');
}
async function completeOrder(orderId) {
  if (!confirm('Mark as completed?')) return;
  await performOrderAction(orderId, 'complete');
}
async function performOrderAction(orderId, action) {
  let endpoint;
  switch (action) {
    case 'confirm-payment': endpoint = `/api/orders/${orderId}/confirm-payment`; break;
    case 'confirm': endpoint = `/api/orders/${orderId}/confirm`; break;
    case 'cancel': endpoint = `/api/orders/${orderId}/cancel`; break;
    case 'ship': endpoint = `/api/orders/${orderId}/ship`; break;
    case 'complete': endpoint = `/api/orders/${orderId}/complete`; break;
    default: throw new Error(`Unknown action: ${action}`);
  }

  try {
    const res = await fetch(`http://localhost:8080${endpoint}`, {
      method: 'POST',
      credentials: 'include'
    });

    if (res.status === 403 || res.status === 401) {
      alert('Session expired or access denied. Please log in again.');
      window.location.href = 'login.html';
      return;
    }

    if (res.ok) {
      loadOrders(); // reload full data and re-apply filter
    } else {
      const errorText = await res.text();
      alert(`Failed to ${action} order: ${errorText}`);
    }
  } catch (e) {
    alert(`Error: ${e.message}`);
  }
}

// === FILTER BUTTON HANDLERS ===
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();

  // Set up filter buttons
  document.getElementById('btn-needs-action').addEventListener('click', () => {
    currentFilter = 'needs-action';
    document.getElementById('btn-needs-action').classList.add('active');
    document.getElementById('btn-all-orders').classList.remove('active');
    applyFilter();
  });

  document.getElementById('btn-all-orders').addEventListener('click', () => {
    currentFilter = 'all';
    document.getElementById('btn-all-orders').classList.add('active');
    document.getElementById('btn-needs-action').classList.remove('active');
    applyFilter();
  });
});