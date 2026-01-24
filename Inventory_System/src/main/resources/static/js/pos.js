let cart = [];
let allItems = [];
let currentOrder = null;
let highlightedIndex = -1;
let appliedTaxes = []; // Supports multiple taxes: [{ type: 'GST', rate: 18 }, { type: 'ET', rate: 2 }]

// Load all items on page load
async function loadItems() {
  try {
    const res = await fetch('http://localhost:8080/api/items/allItems', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to load items');
    
    allItems = await res.json();
    
    allItems = allItems.map(item => ({
      ...item,
      itemName: item.itemName || 'Unknown Item',
      sellingPrice: item.sellingPrice != null ? parseFloat(item.sellingPrice) : 0.00,
      itemCode: item.sku || item.barcode || ''
    }));
    
    console.log("Loaded items:", allItems);
  } catch (e) {
    alert('Error loading items: ' + e.message);
    console.error(e);
  }
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize everything after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Focus search
  const itemSearch = document.getElementById('itemSearch');
  if (itemSearch) itemSearch.focus();

  // Search input
  const debouncedSearch = debounce(handleSearchInput, 200);
  if (itemSearch) itemSearch.addEventListener('input', debouncedSearch);

  // Clear button
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn && itemSearch) {
    itemSearch.addEventListener('input', () => {
      clearBtn.style.display = itemSearch.value ? 'block' : 'none';
    });
    clearBtn.addEventListener('click', () => {
      itemSearch.value = '';
      clearBtn.style.display = 'none';
      document.getElementById('searchResults').style.display = 'none';
      highlightedIndex = -1;
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#itemSearch') && !e.target.closest('#searchResults')) {
      document.getElementById('searchResults').style.display = 'none';
      highlightedIndex = -1;
    }
  });

  // Keyboard navigation
  if (itemSearch) {
    itemSearch.addEventListener('keydown', (e) => {
      const results = document.getElementById('searchResults');
      const items = Array.from(results.querySelectorAll('.list-group-item'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
        highlightItem(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, -1);
        highlightItem(items);
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        items[highlightedIndex].click();
      } else if (e.key === 'Escape') {
        results.style.display = 'none';
        highlightedIndex = -1;
      }
    });
  }

  // Payment method change
  const paymentMethodEl = document.getElementById('paymentMethod');
  if (paymentMethodEl) {
    paymentMethodEl.addEventListener('change', updatePaymentUI);
  }

  // Cash amount received
  const amountReceivedEl = document.getElementById('amountReceived');
  if (amountReceivedEl) {
    amountReceivedEl.addEventListener('input', calculateChange);
  }

  // Complete sale
  const completeSaleBtn = document.getElementById('completeSale');
  if (completeSaleBtn) {
    completeSaleBtn.addEventListener('click', completeSale);
  }

  // Print invoice
  const printInvoiceBtn = document.getElementById('printInvoice');
  if (printInvoiceBtn) {
    printInvoiceBtn.addEventListener('click', printInvoice);
  }

  // Download invoice
  const downloadInvoiceBtn = document.getElementById('downloadInvoice');
  if (downloadInvoiceBtn) {
    downloadInvoiceBtn.addEventListener('click', downloadInvoicePDF);
  }

  // Add tax button
  const addTaxBtn = document.getElementById('addTaxBtn');
  if (addTaxBtn) {
    addTaxBtn.addEventListener('click', () => {
      appliedTaxes.push({ type: 'GST', rate: 0 });
      renderTaxBuilder();
      renderCart();
    });
  }

  // Initialize with one tax
  appliedTaxes = [{ type: 'NONE', rate: 0 }];
  renderTaxBuilder();

  // Initial render
  renderCart();

  // Load items
  loadItems();
});

function highlightItem(items) {
  items.forEach((item, index) => {
    item.classList.toggle('bg-primary', index === highlightedIndex);
    item.classList.toggle('text-white', index === highlightedIndex);
    item.classList.toggle('bg-light', index !== highlightedIndex);
  });
}

function handleSearchInput(e) {
  const term = e.target.value.toLowerCase().trim();
  const results = document.getElementById('searchResults');
  
  if (!term) {
    results.style.display = 'none';
    highlightedIndex = -1;
    return;
  }

  const matches = allItems.filter(item => 
    item.itemName.toLowerCase().includes(term) || 
    (item.itemCode && item.itemCode.toLowerCase().includes(term))
  );

  if (matches.length === 0) {
    results.innerHTML = `<li class="list-group-item empty-state">No items found matching "${term}"</li>`;
    results.style.display = 'block';
    highlightedIndex = -1;
    return;
  }

  results.innerHTML = matches.map((item, index) => 
    `<li class="list-group-item d-flex justify-content-between align-items-center"
        data-item-id="${item.itemId}"
        data-item-name="${item.itemName}"
        data-item-price="${item.sellingPrice}"
        tabindex="0">
      <span>${item.itemName} (${item.itemCode || 'No Code'})</span>
      <span class="badge bg-primary">₹${item.sellingPrice.toFixed(2)}</span>
    </li>`
  ).join('');

  results.querySelectorAll('.list-group-item').forEach(item => {
    item.addEventListener('click', () => {
      const itemId = parseInt(item.dataset.itemId);
      const itemName = item.dataset.itemName;
      const price = parseFloat(item.dataset.itemPrice);
      addItemToCart(itemId, itemName, price);
    });
  });

  results.style.display = 'block';
  highlightedIndex = -1;
}

function addItemToCart(itemId, itemName, price) {
  if (price == null || isNaN(price)) {
    alert(`Price missing for ${itemName}.`);
    return;
  }

  const existing = cart.find(i => i.itemId === itemId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ 
      itemId, 
      itemName, 
      price, 
      quantity: 1,
      discountPercent: 0 
    });
  }

  document.getElementById('itemSearch').value = '';
  document.getElementById('searchResults').style.display = 'none';
  highlightedIndex = -1;
  renderCart();
}

function removeItem(itemId) {
  cart = cart.filter(i => i.itemId !== itemId);
  renderCart();
}

function updateQuantity(itemId, qty) {
  const item = cart.find(i => i.itemId === itemId);
  if (item && qty > 0) item.quantity = parseInt(qty);
  renderCart();
}

function updateItemDiscount(itemId, discount) {
  const item = cart.find(i => i.itemId === itemId);
  if (item) {
    item.discountPercent = Math.min(100, Math.max(0, parseFloat(discount) || 0));
    renderCart();
  }
}

function renderTaxBuilder() {
  const container = document.getElementById('taxBuilder');
  if (!container) return;

  container.innerHTML = '';

  appliedTaxes.forEach((tax, index) => {
    const taxDiv = document.createElement('div');
    taxDiv.className = 'input-group input-group-sm mb-1';
    taxDiv.innerHTML = `
      <select class="form-select tax-type" data-index="${index}">
        <option value="NONE" ${tax.type === 'NONE' ? 'selected' : ''}>No Tax</option>
        <option value="GST" ${tax.type === 'GST' ? 'selected' : ''}>GST</option>
        <option value="ET" ${tax.type === 'ET' ? 'selected' : ''}>Excise Tax</option>
        <option value="CDA" ${tax.type === 'CDA' ? 'selected' : ''}>CDA</option>
        <option value="VAT" ${tax.type === 'VAT' ? 'selected' : ''}>VAT</option>
        <option value="OTHER" ${tax.type === 'OTHER' ? 'selected' : ''}>Other</option>
      </select>
      <input type="number" class="form-control tax-rate" data-index="${index}" 
             value="${tax.rate}" min="0" max="100" step="0.1" placeholder="Rate %">
      <button class="btn btn-outline-danger btn-remove-tax" type="button" data-index="${index}">×</button>
    `;
    container.appendChild(taxDiv);
  });

  // Attach event listeners
  container.querySelectorAll('.tax-type, .tax-rate').forEach(el => {
    el.addEventListener('change', updateTaxFromUI);
    el.addEventListener('input', updateTaxFromUI);
  });

  container.querySelectorAll('.btn-remove-tax').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      if (index >= 0 && index < appliedTaxes.length) {
        appliedTaxes.splice(index, 1);
        renderTaxBuilder();
        renderCart();
      }
    });
  });
}

function updateTaxFromUI(e) {
  const index = parseInt(e.target.dataset.index);
  if (isNaN(index) || index < 0 || index >= appliedTaxes.length) return;

  if (e.target.classList.contains('tax-type')) {
    appliedTaxes[index].type = e.target.value;
  } else if (e.target.classList.contains('tax-rate')) {
    appliedTaxes[index].rate = parseFloat(e.target.value) || 0;
  }
  renderCart();
}

function renderCart() {
  const tbody = document.getElementById('cartItems');
  let subtotal = 0;
  let totalDiscount = 0;

  tbody.innerHTML = cart.map(item => {
    const originalLineTotal = item.price * item.quantity;
    const discountAmount = (originalLineTotal * (item.discountPercent || 0)) / 100;
    const finalLineTotal = originalLineTotal - discountAmount;
    subtotal += originalLineTotal;
    totalDiscount += discountAmount;

    return `
      <tr>
        <td>${item.itemName}</td>
        <td>
          <input type="number" min="1" value="${item.quantity}" 
            onchange="updateQuantity(${item.itemId}, this.value)" style="width:60px;">
        </td>
        <td>₹${item.price.toFixed(2)}</td>
        <td>
          <input type="number" min="0" max="100" step="0.1"
            value="${item.discountPercent || 0}"
            onchange="updateItemDiscount(${item.itemId}, this.value)"
            style="width:60px;"
            placeholder="%">
        </td>
        <td>₹${finalLineTotal.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="removeItem(${item.itemId})">✕</button>
        </td>
      </tr>
    `;
  }).join('');

  // Apply multiple taxes
  let taxableAmount = subtotal - totalDiscount;
  let totalTax = 0;
  appliedTaxes.forEach(tax => {
    if (tax.type !== 'NONE') {
      totalTax += (taxableAmount * tax.rate) / 100;
    }
  });

  const total = taxableAmount + totalTax;

  // Update UI
  const subtotalEl = document.getElementById('subtotalAmount');
  const discountEl = document.getElementById('discountAmount');
  const taxEl = document.getElementById('taxAmount');
  const totalEl = document.getElementById('totalAmount');

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `₹${totalDiscount.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `₹${totalTax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;

  // Update cash change
  const paymentMethod = document.getElementById('paymentMethod')?.value;
  if (paymentMethod === 'CASH') {
    calculateChange();
  }
}

function updatePaymentUI() {
  const paymentMethod = document.getElementById('paymentMethod')?.value;
  const cashSection = document.getElementById('cashChangeSection');
  const printBtn = document.getElementById('printInvoice');

  if (paymentMethod === 'CASH') {
    cashSection?.classList.remove('d-none');
    cashSection.style.display = 'block';
    setTimeout(() => {
      const amountReceived = document.getElementById('amountReceived');
      if (amountReceived) {
        amountReceived.focus();
        amountReceived.select();
      }
    }, 100);
  } else {
    cashSection?.classList.add('d-none');
    cashSection.style.display = 'none';
    document.getElementById('amountReceived').value = '';
    document.getElementById('changeAmount').value = '';
  }

  printBtn?.classList.add('d-none');
}

function calculateChange() {
  const totalText = document.getElementById('totalAmount')?.textContent || '₹0.00';
  const total = parseFloat(totalText.replace('₹', '')) || 0;
  const received = parseFloat(document.getElementById('amountReceived').value) || 0;
  const change = received - total;

  const changeEl = document.getElementById('changeAmount');
  if (changeEl) {
    changeEl.value = change >= 0 ? `₹${change.toFixed(2)}` : 'Insufficient!';
  }
}

async function completeSale() {
  if (cart.length === 0) {
    alert('Add at least one item!');
    return;
  }

  const paymentMethod = document.getElementById('paymentMethod')?.value;

  if (paymentMethod === 'CASH') {
    const received = parseFloat(document.getElementById('amountReceived')?.value) || 0;
    const totalText = document.getElementById('totalAmount')?.textContent || '₹0.00';
    const total = parseFloat(totalText.replace('₹', '')) || 0;
    if (received < total) {
      alert('Insufficient amount received!');
      return;
    }
  }

  // Calculate totals for request
  let subtotal = 0;
  let totalDiscount = 0;
  cart.forEach(item => {
    const original = item.price * item.quantity;
    const disc = (original * item.discountPercent) / 100;
    subtotal += original;
    totalDiscount += disc;
  });

  const request = {
    customerName: document.getElementById('customerName')?.value || null,
    customerPhone: document.getElementById('customerPhone')?.value || null,
    paymentMethod: paymentMethod,
    discountTotal: totalDiscount,
    taxes: appliedTaxes.filter(t => t.type !== 'NONE'), // Send only active taxes
    items: cart.map(i => ({
      itemId: i.itemId,
      quantity: i.quantity,
      discountPercent: i.discountPercent || 0
    }))
  };

  try {
    const res = await fetch('http://localhost:8080/api/orders/pos/sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request)
    });

    if (res.ok) {
      const order = await res.json();
      currentOrder = order;

      alert(`✅ Sale completed! Order #${order.orderId}`);

      document.getElementById('printInvoice')?.classList.remove('d-none');
      generateInvoicePreview(order);

      // Reset
      cart = [];
      appliedTaxes = [{ type: 'NONE', rate: 0 }];
      renderTaxBuilder();
      renderCart();
      document.getElementById('customerName').value = '';
      document.getElementById('customerPhone').value = '';
      document.getElementById('amountReceived').value = '';
      document.getElementById('changeAmount').value = '';
      document.getElementById('cashChangeSection')?.classList.add('d-none');

    } else {
      const err = await res.text();
      alert('Failed: ' + err);
    }
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

function generateInvoicePreview(order) {
  const invoiceModal = new bootstrap.Modal(document.getElementById('invoiceModal'));
  const preview = document.getElementById('invoicePreview');

  // Recalculate for invoice
  let subtotal = 0;
  let totalDiscount = 0;
  cart.forEach(item => {
    const original = item.price * item.quantity;
    const disc = (original * item.discountPercent) / 100;
    subtotal += original;
    totalDiscount += disc;
  });

  let taxableAmount = subtotal - totalDiscount;
  let totalTax = 0;
  appliedTaxes.forEach(tax => {
    if (tax.type !== 'NONE') {
      totalTax += (taxableAmount * tax.rate) / 100;
    }
  });
  const total = taxableAmount + totalTax;

  // Build tax lines
  let taxLinesHtml = '';
  appliedTaxes.forEach(tax => {
    if (tax.type !== 'NONE') {
      const amount = (taxableAmount * tax.rate) / 100;
      taxLinesHtml += `
        <tr class="total-row">
          <td colspan="3">${tax.type} @ ${tax.rate}%:</td>
          <td>+ ₹${amount.toFixed(2)}</td>
        </tr>
      `;
    }
  });

  let itemsHtml = '';
  cart.forEach(item => {
    const originalLineTotal = item.price * item.quantity;
    const discountAmount = (originalLineTotal * item.discountPercent) / 100;
    const finalLineTotal = originalLineTotal - discountAmount;

    itemsHtml += `
      <tr>
        <td>${item.itemName}</td>
        <td>${item.quantity}</td>
        <td>₹${item.price.toFixed(2)}</td>
        <td>₹${finalLineTotal.toFixed(2)}</td>
      </tr>
    `;
  });

  preview.innerHTML = `
    <div class="invoice-header">
      <h4>INVOICE</h4>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      ${order.customerName ? `<p><strong>Customer:</strong> ${order.customerName}</p>` : ''}
      ${order.customerPhone ? `<p><strong>Phone:</strong> ${order.customerPhone}</p>` : ''}
    </div>

    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="3">Subtotal:</td>
          <td>₹${subtotal.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3">Discount (-):</td>
          <td>- ₹${totalDiscount.toFixed(2)}</td>
        </tr>
        ${taxLinesHtml}
        <tr class="total-row">
          <td colspan="3"><strong>Grand Total:</strong></td>
          <td><strong>₹${total.toFixed(2)}</strong></td>
        </tr>
      </tfoot>
    </table>

    <div class="mt-3">
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      ${order.paymentMethod === 'CASH' ? `<p><strong>Amount Received:</strong> ₹${parseFloat(document.getElementById('amountReceived')?.value || 0).toFixed(2)}</p>` : ''}
      ${order.paymentMethod === 'CASH' ? `<p><strong>Change Given:</strong> ₹${(parseFloat(document.getElementById('amountReceived')?.value || 0) - total).toFixed(2)}</p>` : ''}
    </div>

    <div class="mt-4 text-center">
      <p><em>Thank you for shopping with us!</em></p>
    </div>
  `;

  invoiceModal.show();
}

function printInvoice() {
  window.print();
}

function downloadInvoicePDF() {
  alert("PDF download requires jsPDF or server-side generation.");
}