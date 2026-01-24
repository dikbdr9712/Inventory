document.addEventListener('DOMContentLoaded', () => {
  const addItemForm = document.getElementById('addItemForm');
  const messageDiv = document.getElementById('message');

  addItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';
    messageDiv.className = '';

    // Get required values
    const itemName = document.getElementById('itemName').value.trim();
    const costPriceInput = document.getElementById('costPrice').value.trim();
    const category = document.getElementById('category').value.trim();
  

    // Validate required fields
    if (!itemName) {
      messageDiv.textContent = '❌ Item Name is required.';
      messageDiv.className = 'error';
      return;
    }

    if (!costPriceInput || isNaN(costPriceInput) || parseFloat(costPriceInput) < 0) {
      messageDiv.textContent = '❌ Valid Cost Price is required (must be a number ≥ 0).';
      messageDiv.className = 'error';
      return;
    }

    if (!category) {
      messageDiv.textContent = '❌ Category is required.';
      messageDiv.className = 'error';
      return;
    }

    // Build FormData — ONLY send what we need for now
    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('description', document.getElementById('description').value.trim() || '');
    formData.append('uom', document.getElementById('uom').value || 'pcs');
    formData.append('costPrice', costPriceInput);
    formData.append('barcode', document.getElementById('barcode').value.trim() || '');
    formData.append('supplierItemCode', document.getElementById('supplierItemCode').value.trim() || '');
    formData.append('category', category);

    // Append image if selected
    const imageFile = document.getElementById('imageFile').files[0];
    if (imageFile) {
      formData.append('images', imageFile);
    }

    try {
      const response = await fetch('http://localhost:8080/api/items/addItems', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        messageDiv.textContent = '✅ Item added successfully!';
        messageDiv.className = 'success';
        addItemForm.reset();
      } else {
        const errorText = await response.text();
        messageDiv.textContent = '❌ Failed: ' + (errorText || 'Unknown error');
        messageDiv.className = 'error';
      }
    } catch (err) {
      messageDiv.textContent = '❌ Network error: ' + err.message;
      messageDiv.className = 'error';
    }
  });
});