document.addEventListener('DOMContentLoaded', () => {
  const addItemForm = document.getElementById('addItemForm');
  const messageDiv = document.getElementById('message');

  addItemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageDiv.textContent = '';
  messageDiv.className = '';

  const itemName = document.getElementById('itemName').value.trim();
  if (!itemName) {
    messageDiv.textContent = '❌ Item Name is required.';
    messageDiv.className = 'error';
    return;
  }

  const formData = new FormData();

// Append each field individually (as form fields)
formData.append('itemName', itemName);
formData.append('description', document.getElementById('description').value.trim() || '');
formData.append('uom', document.getElementById('uom').value || 'pcs');
formData.append('pricePerUnit', document.getElementById('pricePerUnit').value || '');
formData.append('barcode', document.getElementById('barcode').value.trim() || '');
formData.append('supplierItemCode', document.getElementById('supplierItemCode').value.trim() || '');

// Append image file (if selected)
const imageFile = document.getElementById('imageFile').files[0];
if (imageFile) {
  formData.append('images', imageFile);
}

  try {
    const response = await fetch('http://localhost:8080/api/items/addItems', {
      method: 'POST',
      // ⚠️ DO NOT set Content-Type — let browser set it with boundary
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