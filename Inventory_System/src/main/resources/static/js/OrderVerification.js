document.addEventListener('DOMContentLoaded', async () => {
  const ordersList = document.getElementById('orders-list');
  let allOrders = [];
  let currentSortOrder = 'desc';

  // Helper: get sorted orders
  function getSortedOrders(orders) {
    return [...orders].sort((a, b) => {
      const idA = a.orderId || 0;
      const idB = b.orderId || 0;
      return currentSortOrder === 'asc' ? idA - idB : idB - idA;
    });
  }

  // Render orders (expects already-filtered & sorted list)
  function renderOrders(orders) {
    ordersList.innerHTML = '';

    if (orders.length === 0) {
      ordersList.innerHTML = '<div class="alert alert-warning">No matching orders found.</div>';
      return;
    }

    orders.forEach(order => {
      const payment = order.payment || {};
      const paymentMethod = payment.paymentMethod || 'N/A';
      const journalNumber = payment.journalNumber || 'Not provided';
      const amount = payment.amount ? `Nu. ${parseFloat(payment.amount).toFixed(2)}` : 'Unknown';

      const paymentId = payment?.paymentId || payment?.id || '';
      const updatedBy = order.updatedBy || '—';
      const updatedAt = order.updatedAt 
        ? new Date(order.updatedAt).toLocaleString() 
        : 'Never';

      const card = document.createElement('div');
      card.className = 'order-card';
      card.innerHTML = `
        <div class="d-flex justify-content-between">
          <h5>Order #${order.orderId} — ${order.customerName} (${order.customerEmail})</h5>
          <span class="badge status-badge badge-secondary">${order.orderStatus}</span>
        </div>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Amount:</strong> ${amount}</p>
        <p><strong>Journal Number:</strong> <code>${journalNumber}</code></p>
        <p><strong>Created:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Verified by:</strong> ${updatedBy} <em>(on ${updatedAt})</em></p>
        <div class="mt-3 d-flex align-items-center">
          <select id="status-select-${order.orderId}" class="form-control mr-2" style="width: auto; min-width: 180px;">
            <option value="">-- Select Action --</option>
            <option value="PAID">✅ Mark as Paid</option>
            <option value="PARTIALLY_PAID">⚠️ Partially Paid</option>
            <option value="REJECTED">❌ Reject</option>
            <option value="PENDING_INFO">📩 Request Info</option>
            <option value="FAILED">🚫 Mark Failed</option>
          </select>
          <button 
            class="btn btn-primary btn-sm apply-status-btn" 
            data-order-id="${order.orderId}"
            data-payment-id="${paymentId}">
            Apply
          </button>
        </div>
      `;
      ordersList.appendChild(card);
    });

    // Re-bind button events
    document.querySelectorAll('.apply-status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const orderId = e.target.dataset.orderId;
        const paymentId = e.target.dataset.paymentId;
        const select = document.getElementById(`status-select-${orderId}`);
        const action = select.value;

        if (!action) {
          alert("⚠️ Please select an action.");
          return;
        }

        // Map frontend action to payment status
        let paymentStatus = '';
        let note = '';

        switch (action) {
          case 'PAID':
            paymentStatus = 'PAID'; // or 'PAID' — match your backend enum
            note = 'Payment verified as fully paid.';
            break;
          case 'PARTIALLY_PAID':
            paymentStatus = 'partially_paid';
            note = 'Payment verified as partially paid.';
            break;
          case 'REJECTED':
            paymentStatus = 'rejected';
            note = 'Payment rejected due to invalid proof.';
            break;
          case 'PENDING_INFO':
            paymentStatus = 'pending_info';
            note = 'Customer contacted for additional payment proof.';
            break;
          case 'FAILED':
            paymentStatus = 'failed';
            note = 'Payment marked as failed.';
            break;
          default:
            alert("Unknown action");
            return;
        }

        if (!confirm(`Are you sure you want to mark this payment as ${action.replace('_', ' ').toLowerCase()}?`)) {
          return;
        }

        try {
          // Step 1: Update payment status
          if (!paymentId || paymentId.trim() === '') {
            alert('⚠️ No payment record found.');
            return;
          }

          const paymentRes = await fetch(`http://localhost:8080/api/payments/${paymentId}/status?status=${paymentStatus}`, {
            method: 'PUT'
          });

          if (!paymentRes.ok) {
            const errText = await paymentRes.text();
            throw new Error('Failed to update payment: ' + errText);
          }

          // Step 2: Update order note & updatedBy (via /verify)
          const orderRes = await fetch(`http://localhost:8080/api/orders/${orderId}/verify`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: null, // ← don't change order status!
              paymentStatus: paymentStatus,
              note: note 
            })
          });

          if (!orderRes.ok) {
            const errText = await orderRes.text();
            throw new Error('Failed to update order note: ' + errText);
          }

          alert(`✅ Payment marked as ${action.replace('_', ' ').toLowerCase()}.`);
          location.reload();

        } catch (err) {
          console.error(err);
          alert('❌ Error: ' + err.message);
        }
      });
    });
  }

  // Refresh view: apply search + sort
  function refreshView() {
    const searchTerm = document.getElementById('search-verification-orders')?.value.toLowerCase().trim() || '';
    let filtered = allOrders;

    if (searchTerm) {
      filtered = allOrders.filter(order => {
        return (
          String(order.orderId).includes(searchTerm) ||
          (order.customerName || '').toLowerCase().includes(searchTerm) ||
          (order.customerEmail || '').toLowerCase().includes(searchTerm) ||
          (order.payment?.journalNumber || '').toLowerCase().includes(searchTerm)
        );
      });
    }

    renderOrders(getSortedOrders(filtered));
  }

  try {
    const orderRes = await fetch('http://localhost:8080/api/orders/status/CREATED');
    const orders = await orderRes.json();

    if (!Array.isArray(orders)) {
      console.error("Expected array but got:", orders);
      throw new Error("Invalid response format");
    }

    if (orders.length === 0) {
      ordersList.innerHTML = '<div class="alert alert-info">No orders pending verification.</div>';
      return;
    }

    // Fetch payment details for each order
    const ordersWithPayment = await Promise.all(
      orders.map(async (order) => {
        let payment = null;
        try {
          const paymentRes = await fetch(`http://localhost:8080/api/payments/order/${order.orderId}`);
          if (paymentRes.ok) {
            payment = await paymentRes.json();
          }
        } catch (err) {
          console.warn("Failed to load payment for order", order.orderId);
        }
        return { ...order, payment };
      })
    );

    allOrders = ordersWithPayment;
    refreshView();

    // Event listeners
    document.getElementById('search-verification-orders')?.addEventListener('input', refreshView);
    document.getElementById('sort-asc')?.addEventListener('click', () => {
      currentSortOrder = 'asc';
      refreshView();
    });
    document.getElementById('sort-desc')?.addEventListener('click', () => {
      currentSortOrder = 'desc';
      refreshView();
    });

  } catch (err) {
    console.error(err);
    ordersList.innerHTML = '<div class="alert alert-danger">Failed to load orders.</div>';
  }
});