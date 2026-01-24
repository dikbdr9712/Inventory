document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('itemId');

  if (!itemId || isNaN(itemId)) {
    alert("❌ Invalid product selection.");
    window.location.href = "Product.html";
    return;
  }

  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  const email = localStorage.getItem('userEmail');
  console.log("User email from localStorage:", email); // Debug log

  if (!userRole || !userName) {
    alert("⚠️ Please log in to complete your purchase.");
    window.location.href = "login.html";
    return;
  }

  // DOM Elements
  const summaryEl = document.getElementById('order-summary');
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const billingName = document.getElementById('billingName');
  const billingPhone = document.getElementById('billingPhone');
  const billingAddress = document.getElementById('billingAddress');
  let currentItem = null;

  if (userName) billingName.value = userName;

  // Load product
  async function loadProduct() {
    try {
      summaryEl.innerHTML = '<p>Loading product details...</p>';
      const res = await fetch(`http://localhost:8080/api/items/${itemId}`);
      
      if (res.status === 401) {
        alert("⚠️ Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      currentItem = await res.json();
      renderOrderSummary();
    } catch (err) {
      console.error(err);
      summaryEl.innerHTML = `<div class="alert alert-danger">⚠️ Failed to load product.</div>`;
      placeOrderBtn.disabled = true;
    }
  }

  function renderOrderSummary() {
    if (!currentItem) return;

    const imageUrl = currentItem.imagePath 
      ? `http://localhost:8080${currentItem.imagePath}` 
      : '../Images/default.jpg';

    const price = currentItem.sellingPrice || 0;
    const stock = currentItem.currentStock || 0;
    const uom = currentItem.uom || 'pcs';

    let qty = 1;
    const existingQtyInput = document.getElementById('quantityInput');
    if (existingQtyInput) {
      qty = parseInt(existingQtyInput.value) || 1;
    }
    qty = Math.min(qty, stock);

    const quantityControlHtml = stock > 0 ? `
      <div class="d-flex align-items-center mt-2">
        <button id="decreaseQty" class="btn btn-outline-secondary btn-sm" type="button">-</button>
        <input 
          type="number" 
          id="quantityInput" 
          min="1" 
          max="${stock}" 
          value="${qty}" 
          class="form-control text-center mx-2" 
          style="width: 70px; padding: 0.25rem;"
          oninput="updateTotal()"
        />
        <button id="increaseQty" class="btn btn-outline-secondary btn-sm" type="button">+</button>
        <small class="text-muted ml-2">(Available: ${stock} ${uom})</small>
      </div>
    ` : `<p class="text-danger mt-2">Out of stock</p>`;

    summaryEl.innerHTML = `
      <div class="d-flex align-items-start">
        <img src="${imageUrl}" alt="${escapeHtml(currentItem.itemName)}" 
            class="mr-3" 
            style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px;">
        <div>
          <h6 class="mb-1">${escapeHtml(currentItem.itemName)}</h6>
          <p class="mb-1 text-muted">Price: Nu. ${price.toFixed(2)}</p>
          ${quantityControlHtml}
        </div>
      </div>
      <div class="d-flex justify-content-between mt-3">
        <strong>Total:</strong>
        <strong id="totalAmount" class="text-success">Nu. ${(price * qty).toFixed(2)}</strong>
      </div>
    `;

    setupQuantityControls();
  }

  function setupQuantityControls() {
    const qtyInput = document.getElementById('quantityInput');
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');

    if (!qtyInput || !currentItem) return;

    const stock = currentItem.currentStock || 0;
    qtyInput.max = stock;
    qtyInput.value = Math.min(parseInt(qtyInput.value) || 1, stock);

    // Clear previous listeners by cloning
    const cloneDecrease = decreaseBtn.cloneNode(true);
    const cloneIncrease = increaseBtn.cloneNode(true);
    decreaseBtn.parentNode.replaceChild(cloneDecrease, decreaseBtn);
    increaseBtn.parentNode.replaceChild(cloneIncrease, increaseBtn);

    // Reassign
    document.getElementById('decreaseQty').addEventListener('click', () => {
      let val = parseInt(document.getElementById('quantityInput').value) || 1;
      if (val > 1) document.getElementById('quantityInput').value = val - 1;
      updateTotal();
    });

    document.getElementById('increaseQty').addEventListener('click', () => {
      let val = parseInt(document.getElementById('quantityInput').value) || 1;
      if (val < stock) document.getElementById('quantityInput').value = val + 1;
      updateTotal();
    });

    document.getElementById('quantityInput').addEventListener('input', updateTotal);
  }

  function updateTotal() {
    if (!currentItem) return;
    const qtyInput = document.getElementById('quantityInput');
    if (!qtyInput) return;

    let qty = parseInt(qtyInput.value) || 1;
    const max = parseInt(qtyInput.max) || 0;
    if (qty < 1) qty = 1;
    if (qty > max) qty = max;
    qtyInput.value = qty;

    const total = currentItem.sellingPrice * qty;
    document.getElementById('totalAmount').textContent = `Nu. ${total.toFixed(2)}`;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function saveOrderToLocal(order) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
  }

  // Payment method toggle
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const bankDetails = document.getElementById('bank-details');
      if (radio.value === 'bank') {
        bankDetails.style.display = 'block';
        document.getElementById('order-id-ref').textContent = Math.floor(100000 + Math.random() * 900000);
      } else {
        bankDetails.style.display = 'none';
      }
    });
  });

  // Place Order Button
  let isSubmitting = false;
  placeOrderBtn.addEventListener('click', async () => {
    if (isSubmitting) return;

    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethodEl) {
      alert("⚠️ Please select a payment method.");
      return;
    }

    const paymentMethod = paymentMethodEl.value;
    const name = billingName.value.trim();
    const phone = billingPhone.value.trim();
    const address = billingAddress.value.trim();

    const qtyInput = document.getElementById('quantityInput');
    const quantity = parseInt(qtyInput?.value) || 1;

    // Validate billing info
    if (!name || !phone || !address) {
      alert("⚠️ Please fill all billing fields.");
      return;
    }

    if (!/^[0-9]{8}$/.test(phone)) {
      alert("⚠️ Please enter a valid 8-digit Bhutanese phone number.");
      return;
    }

    if (quantity <= 0 || quantity > (currentItem?.currentStock || 0)) {
      alert("⚠️ Invalid quantity selected.");
      return;
    }

    const total = currentItem.sellingPrice * quantity;

    // Handle journal number for bank payments
    let journalNumber = '';
    if (paymentMethod === 'bank') {
      journalNumber = document.getElementById('journalNumber')?.value.trim();
      if (!journalNumber) {
        alert("⚠️ Please enter the Transaction Journal Number for bank transfer.");
        return;
      }
    }

    isSubmitting = true;
    placeOrderBtn.textContent = "Processing...";
    placeOrderBtn.disabled = true;

    try {
      // ✅ FIXED: Use 'address' (lowercase) to match DTO
      const orderData = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        address: address, // ← lowercase 'a'
        totalAmount: total,
        orderStatus: "PENDING",
        items: [
          {
            itemId: parseInt(itemId),
            quantity: quantity,
            unitPrice: currentItem.sellingPrice
          }
        ]
      };

      const orderRes = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        console.error("Order creation failed:", errorText);
        throw new Error(`Failed to create order: ${orderRes.status}`);
      }

      const orderResult = await orderRes.json();
      const createdOrderId = orderResult.orderId;

      // Record payment
      const paymentData = {
        orderId: createdOrderId,
        amount: total,
        paymentMethod: paymentMethod,
        status: "pending",
        journalNumber: paymentMethod === 'bank' ? journalNumber : null
      };

      const paymentRes = await fetch('http://localhost:8080/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (!paymentRes.ok) {
        const errorText = await paymentRes.text();
        console.error("Payment creation failed:", errorText);
        alert(`❌ Failed to save payment record. Order #${createdOrderId} may not appear in verification list.`);
        // Optional: Don't proceed to success screen
        return; // ← Stop here if payment failed
      }

      // Success
      alert(`✅ Order #${createdOrderId} placed!\nTotal: Nu. ${total.toFixed(2)}`);
      window.location.href = `order-success.html?orderId=${createdOrderId}`;

    } catch (error) {
      console.error("Order/Payment submission error:", error);
      alert("❌ Failed to complete order. Please try again.");
    } finally {
      isSubmitting = false;
      placeOrderBtn.textContent = "✅ Place Order";
      placeOrderBtn.disabled = false;
    }
  });

  // Initial load
  loadProduct();
});