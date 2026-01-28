document.addEventListener('DOMContentLoaded', () => {
  const addItemForm = document.getElementById('addItemForm');
  const messageDiv = document.getElementById('message');
  const pricingMethod = document.getElementById('pricingMethod');
  const pricingInput = document.getElementById('pricingInput');
  const pricingHint = document.getElementById('pricingHint');

  // Update UI when pricing method changes
  pricingMethod.addEventListener('change', () => {
    if (pricingMethod.value === 'markupPercent') {
      pricingHint.textContent = 'Enter markup % (e.g., 25 for 25%)';
      pricingInput.placeholder = 'e.g., 25.0';
      pricingInput.step = '0.1';
    } else {
      pricingHint.textContent = 'Enter final selling price (e.g., 50.00)';
      pricingInput.placeholder = 'e.g., 50.00';
      pricingInput.step = '0.01';
    }
  });

  // Calculate final selling price
  function calculateSellingPrice(costPrice) {
    const method = pricingMethod.value;
    const inputVal = parseFloat(pricingInput.value);

    if (isNaN(inputVal)) {
      throw new Error(`Please enter a valid ${method === 'markupPercent' ? 'Markup %' : 'Selling Price'}.`);
    }

    if (method === 'markupPercent') {
      if (inputVal < 0) throw new Error("Markup % cannot be negative.");
      return costPrice * (1 + inputVal / 100);
    } else {
      if (inputVal <= 0) throw new Error("Selling Price must be greater than 0.");
      return inputVal;
    }
  }

  // Form submission
  addItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';
    messageDiv.className = '';

    const itemName = document.getElementById('itemName').value.trim();
    const costPriceStr = document.getElementById('costPrice').value.trim();
    const category = document.getElementById('category').value.trim();

    // Validate basics
    if (!itemName) {
      messageDiv.textContent = '❌ Item Name is required.';
      messageDiv.className = 'error';
      return;
    }

    const costPrice = parseFloat(costPriceStr);
    if (isNaN(costPrice) || costPrice < 0) {
      messageDiv.textContent = '❌ Valid Cost Price is required (must be ≥ 0).';
      messageDiv.className = 'error';
      return;
    }

    if (!category) {
      messageDiv.textContent = '❌ Category is required.';
      messageDiv.className = 'error';
      return;
    }

    // Calculate selling price
    let sellingPrice;
    try {
      sellingPrice = calculateSellingPrice(costPrice);
    } catch (err) {
      messageDiv.textContent = '❌ ' + err.message;
      messageDiv.className = 'error';
      return;
    }

    // Build form data
    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('description', document.getElementById('description').value.trim() || '');
    formData.append('uom', document.getElementById('uom').value || 'pcs');
    formData.append('costPrice', costPrice.toFixed(2));
    formData.append('sellingPrice', sellingPrice.toFixed(2)); // ✅ Only this goes to backend
    formData.append('barcode', document.getElementById('barcode').value.trim() || '');
    formData.append('supplierItemCode', document.getElementById('supplierItemCode').value.trim() || '');
    formData.append('category', category);

    const imageFile = document.getElementById('imageFile').files[0];
    if (imageFile) {
      formData.append('images', imageFile);
    }

    // Submit
    try {
      const response = await fetch('http://localhost:8080/api/items/addItems', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        messageDiv.textContent = '✅ Item added successfully!';
        messageDiv.className = 'success';
        addItemForm.reset();
        // Reset hint
        pricingHint.textContent = 'Enter final selling price (e.g., 50.00)';
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