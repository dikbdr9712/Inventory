// edit-item.js

document.addEventListener('DOMContentLoaded', () => {
  const editForm = document.getElementById('editItemForm');
  const messageDiv = document.getElementById('message');
  const currentImage = document.getElementById('currentImage');

  // Get itemId from URL (e.g., edit-item.html?itemId=26)
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('itemId');

  if (!itemId) {
    messageDiv.textContent = '❌ Item ID missing.';
    messageDiv.className = 'error';
    return;
  }

  // Load item data
  loadItem(itemId);

  async function loadItem(id) {
    try {
      const response = await fetch(`http://localhost:8080/api/items/${id}`);
      if (!response.ok) throw new Error('Failed to fetch item');

      const item = await response.json();

      // Fill form fields
      document.getElementById('itemId').value = item.itemId;
      document.getElementById('itemName').value = item.itemName || '';
      document.getElementById('description').value = item.description || '';
      document.getElementById('uom').value = item.uom || 'pcs';
      document.getElementById('pricePerUnit').value = item.pricePerUnit || '';
      document.getElementById('barcode').value = item.barcode || '';
      document.getElementById('supplierItemCode').value = item.supplierItemCode || '';

      // Show current image
      if (item.imagePath) {
        currentImage.src = `http://localhost:8080${item.imagePath}`;
      } else {
        currentImage.src = 'Images/default.jpg';
      }

    } catch (err) {
      messageDiv.textContent = '❌ Failed to load item: ' + err.message;
      messageDiv.className = 'error';
    }
  }

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';
    messageDiv.className = '';

    const itemName = document.getElementById('itemName').value.trim();
    if (!itemName) {
      messageDiv.textContent = '❌ Item Name is required.';
      messageDiv.className = 'error';
      return;
    }

    const itemId = document.getElementById('itemId').value;
    const formData = new FormData();

    // ✅ Append each field individually (NO JSON!)
    formData.append('itemName', itemName);
    formData.append('description', document.getElementById('description').value.trim() || '');
    formData.append('uom', document.getElementById('uom').value || 'pcs');
    
    const pricePerUnit = document.getElementById('pricePerUnit').value.trim();
    if (pricePerUnit) {
        formData.append('pricePerUnit', pricePerUnit);
    }

    formData.append('barcode', document.getElementById('barcode').value.trim() || '');
    formData.append('supplierItemCode', document.getElementById('supplierItemCode').value.trim() || '');

    // Append image file (if selected)
    const imageFile = document.getElementById('imageFile').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
      const response = await fetch(`http://localhost:8080/api/items/${itemId}`, {
        method: 'PUT',
        body: formData
        // ⚠️ DO NOT set Content-Type — let browser set it automatically
      });

      if (response.ok) {
        messageDiv.textContent = '✅ Item updated successfully!';
        messageDiv.className = 'success';
        messageDiv.style.display = 'block';
        // Redirect after success
        setTimeout(() => {
          window.location.href = 'Product.html';
        }, 2000);
      } else {
        const errorText = await response.text();
        messageDiv.textContent = '❌ Failed: ' + (errorText || 'Unknown error');
        messageDiv.className = 'error';
        messageDiv.style.display = 'block';
      }
    } catch (err) {
      messageDiv.textContent = '❌ Network error: ' + err.message;
      messageDiv.className = 'error';
      messageDiv.style.display = 'block';
    }
  });
});