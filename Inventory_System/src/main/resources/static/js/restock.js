document.addEventListener('DOMContentLoaded', () => {
  const itemSearch = document.getElementById('itemSearch');
  const suggestionsBox = document.getElementById('itemSuggestions');
  const newItemSection = document.getElementById('newItemSection');
  const restockForm = document.getElementById('restockForm');
  const messageDiv = document.getElementById('message');

  let selectedItem = null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const prefillSku = urlParams.get('sku');
  const prefillItemName = urlParams.get('itemName');
  if (prefillSku) {
    document.getElementById('itemSearch').value = `${prefillSku} - ${prefillItemName || ''}`;
    selectedItem = { sku: prefillSku, itemName: prefillItemName || '' };
    newItemSection.classList.add('hidden');
  }
  // Search as user types
  itemSearch.addEventListener('input', async (e) => {
    const term = e.target.value.trim();
    suggestionsBox.innerHTML = '';
    suggestionsBox.style.display = 'none';
    newItemSection.classList.add('hidden');
    selectedItem = null;

    if (term.length < 2) return;

    try {
      const response = await fetch(`http://localhost:8080/api/items/search?term=${encodeURIComponent(term)}`);
      const items = await response.json();

      if (items.length === 0) {
        const div = document.createElement('div');
        div.style.padding = '8px';
        div.style.cursor = 'pointer';
        div.style.backgroundColor = '#e9ecef';
        div.textContent = `+ Add new item: "${term}"`;
        div.onclick = () => showNewItemForm(term);
        suggestionsBox.appendChild(div);
      } else {
        items.forEach(item => {
          const div = document.createElement('div');
          div.textContent = `${item.sku} - ${item.itemName}`;
          div.style.padding = '8px';
          div.style.cursor = ' pointer';
          div.onmouseover = () => div.style.backgroundColor = '#f1f1f1';
          div.onmouseout = () => div.style.backgroundColor = '';
          div.onclick = () => selectItem(item);
          suggestionsBox.appendChild(div);
        });
      }
      suggestionsBox.style.display = 'block';
    } catch (err) {
      console.error('Search error:', err);
      messageDiv.textContent = '⚠️ Search failed: ' + err.message;
      messageDiv.className = 'error';
    }
  });

  document.addEventListener('click', (e) => {
    if (!itemSearch.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });

  function selectItem(item) {
    selectedItem = item;
    itemSearch.value = `${item.sku} - ${item.itemName}`;
    newItemSection.classList.add('hidden');
    
    // Remove required from new item fields
    document.getElementById('newSku').required = false;
    document.getElementById('newItemName').required = false;
    
    suggestionsBox.style.display = 'none';
}

function showNewItemForm(term) {
    selectedItem = null;
    itemSearch.value = term;
    document.getElementById('newSku').value = term;
    newItemSection.classList.remove('hidden');
    
    // Make new item fields required
    document.getElementById('newSku').required = true;
    document.getElementById('newItemName').required = true;
    
    suggestionsBox.style.display = 'none';
}

  restockForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';
    messageDiv.className = '';

    const quantity = parseInt(document.getElementById('quantity').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const supplier = document.getElementById('supplier').value.trim();

    if (quantity <= 0 || isNaN(unitPrice) || !supplier) {
        messageDiv.textContent = '❌ Quantity, Unit Price, and Supplier are required.';
        messageDiv.className = 'error';
        return;
    }

    const request = {
        quantity: quantity,
        unitPrice: unitPrice,
        customerOrSupplier: supplier,
        notes: document.getElementById('notes').value.trim() || null
    };

    if (selectedItem) {
        request.sku = selectedItem.sku;
    } else {
        // New item — validate fields
        const newSku = document.getElementById('newSku').value.trim();
        const newItemName = document.getElementById('newItemName').value.trim();

        if (!newSku || !newItemName) {
            messageDiv.textContent = '❌ SKU and Item Name are required for new items.';
            messageDiv.className = 'error';
            return;
        }

        request.sku = newSku;
        request.itemName = newItemName;
        request.description = document.getElementById('newDescription').value.trim() || null;
        request.uom = document.getElementById('newUom').value || 'nbr';
        request.sellingPrice = document.getElementById('newsellingPrice').value 
          ? parseFloat(document.getElementById('newsellingPrice').value) : null;
        request.barcode = document.getElementById('newBarcode').value.trim() || null;
        request.supplierItemCode = document.getElementById('newSupplierItemCode').value.trim() || null;
    }

    try {
        const response = await fetch('http://localhost:8080/api/transactions/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });

        if (response.ok) {
            messageDiv.textContent = '✅ Item restocked successfully!';
            messageDiv.className = 'success';
            restockForm.reset();
            newItemSection.classList.add('hidden');
            selectedItem = null;
            itemSearch.value = '';

        } else {
            const errorText = await response.text();
            messageDiv.textContent = '❌ Restock failed: ' + (errorText || 'Unknown error');
            messageDiv.className = 'error';
        }
    } catch (err) {
        messageDiv.textContent = '❌ Network error: ' + err.message;
        messageDiv.className = 'error';
    }
});
});