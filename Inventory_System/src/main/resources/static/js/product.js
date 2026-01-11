// Global function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Global functions (accessible from HTML onclick)
window.openRestock = function(sku, name) {
  if (!sku || !name) {
    alert("Cannot restock: missing SKU or item name.");
    return;
  }
  const url = `restock.html?sku=${encodeURIComponent(sku)}&itemName=${encodeURIComponent(name)}`;
  window.open(url, '_blank');
};

window.openNewItemForm = function() {
  window.open('new-item.html', '_blank');
};

window.addToCart = function(product) {
  if (product.stock <= 0) {
    alert("❌ This item is out of stock.");
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`✅ "${product.name}" added to cart!`);
  updateCartBadge();
};

// Function to update cart badge (global so addToCart can call it)
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badge = document.getElementById('cart-count-badge');
  if (badge) {
    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.classList.add('show');
    } else {
      badge.classList.remove('show');
    }
  }
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  const categoryList = document.querySelectorAll("#filter-list li");
  const cardGallery = document.getElementById("card-gallery-wrapper");
  const productDetail = document.getElementById("product-detail");

  let allItems = [];
  let currentSearchTerm = ''; // Track search term

  // Function to render product cards
  function renderCards(items) {
    cardGallery.innerHTML = '';
    const userRole = localStorage.getItem('userRole');
    const canRestock = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'CONTROLLER';

    items.forEach(item => {
      let imageUrl = 'Images/default.jpg';

      if (item.imagePath && item.imagePath.trim() !== '') {
        imageUrl = `http://localhost:8080${item.imagePath}`;
      } else {
        const imageName = item.itemName.toLowerCase().replace(/\s+/g, '') + '.jpg';
        imageUrl = `Images/${imageName}`;
      }

      const availability = item.availability || 'Unavailable';
      const statusColor = availability === 'Available' ? 'green' : 'red';
      const price = item.pricePerUnit != null ? `Nu. ${item.pricePerUnit.toFixed(2)}` : 'N/A';
      const stock = item.currentStock != null ? item.currentStock : 'N/A';

      const safeItemName = escapeHtml(item.itemName);
      const safeSku = escapeHtml(item.sku || '');

      let restockBtnHtml = '';
      if (canRestock) {
        if (item.sku && item.sku.trim() !== '') {
          restockBtnHtml = `
            <button class="restock-btn" onclick="openRestock('${safeSku}', '${safeItemName}')">
              Restock
            </button>
          `;
        } else {
          restockBtnHtml = `
            <button class="restock-btn" disabled title="Item has no SKU. Edit item first to assign one.">
              No SKU
            </button>
          `;
        }
      }

      const card = `
        <li data-group="0" onclick="showProductDetail(${item.itemId})">
          <div class="card">
            <img src="${imageUrl}" alt="${safeItemName}" class="pic" 
                 onerror="this.src='Images/default.jpg'">
            <h3>${safeItemName}</h3>
            <p>Price: ${price}</p>
            <p>Stock: ${stock} ${item.uom || ''}</p>
            <p>Status: <span style="color: ${statusColor}">${availability}</span></p>
            ${restockBtnHtml}
          </div>
        </li>
      `;
      cardGallery.innerHTML += card;
    });
  }

  // Show product detail
  window.showProductDetail = function(itemId) {
    const item = allItems.find(i => i.itemId === itemId);
    if (!item) return;

    document.getElementById('detail-title').textContent = item.itemName;

    let detailImageUrl = 'Images/default.jpg';
    if (item.imagePath && item.imagePath.trim() !== '') {
      detailImageUrl = `http://localhost:8080${item.imagePath}`;
    } else {
      const imageName = item.itemName.toLowerCase().replace(/\s+/g, '') + '.jpg';
      detailImageUrl = `Images/${imageName}`;
    }
    document.getElementById('detail-image').src = detailImageUrl;
    document.getElementById('detail-desc').textContent = item.description || '';
    document.getElementById('detail-price').textContent = item.pricePerUnit != null ? `Nu. ${item.pricePerUnit.toFixed(2)}` : 'N/A';
    document.getElementById('detail-stock').textContent = item.currentStock || 'N/A';
    document.getElementById('detail-uom').textContent = item.uom || '';
    const availability = item.availability || 'Unavailable';
    const statusEl = document.getElementById('detail-status');
    statusEl.textContent = availability;
    statusEl.className = availability === 'Available' ? 'status-available' : 'status-unavailable';

    // Re-bind Add to Cart
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.replaceWith(addToCartBtn.cloneNode(true));
      document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        addToCart({
          id: item.itemId,
          name: item.itemName,
          price: item.pricePerUnit,
          image: detailImageUrl,
          stock: item.currentStock
        });
      });
    }

    // Buy Now
    document.getElementById('buy-button').href = `product(orderForm).html?itemId=${itemId}`;

    // Edit button (role-based)
    const userRole = localStorage.getItem('userRole');
    const canEdit = userRole === 'ADMIN' || userRole === 'MANAGER';
    const editBtn = document.getElementById('edit-item-btn');
    editBtn.href = `edit-item.html?itemId=${itemId}`;
    editBtn.style.display = canEdit ? 'inline-block' : 'none';

    // Show detail view
    document.getElementById('container').style.display = 'none';
    document.getElementById('product-detail').style.display = 'block';
  };

  // ✅ BACK TO PRODUCTS
  window.showProducts = function() {
    const container = document.getElementById("container");
    const pd = document.getElementById("product-detail");
    const cg = document.getElementById("card-gallery-wrapper");
    if (container && productDetail && cardGallery) {
      productDetail.style.display = 'none';
      container.style.display = 'block';
      cardGallery.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filter logic (simplified)
  function onFilterClick(e) {
    cardGallery.querySelectorAll('li').forEach(li => li.classList.remove('hidden'));
  }

  // Initialize UI based on role
  function updateAdminUI() {
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'ADMIN';
    const isManager = userRole === 'MANAGER';
    const addBtn = document.getElementById('addNewItemBtn');
    if (addBtn) {
      addBtn.style.display = (isAdmin || isManager) ? 'inline-block' : 'none';
    }
  }

  // Fetch products
  async function init() {
    try {
      const response = await fetch('http://localhost:8080/api/items/allItems');
      
      if (response.status === 401) {
        alert("⚠️ You need to log in to view products.");
        window.location.href = 'login.html';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      allItems = await response.json();

      // Initial render
      renderCards(allItems);

      // Add search listener
      document.getElementById('search-products').addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase().trim();
        if (!currentSearchTerm) {
          renderCards(allItems); // Show all
        } else {
          const filtered = allItems.filter(item => {
          const term = currentSearchTerm;

          const name = (item.itemName || '').toLowerCase();
          const desc = (item.description || '').toLowerCase();
          const sku = (item.sku || '').toLowerCase();
          const category = (item.category || '').toLowerCase(); // 👈 Now available!

          return (
            name.includes(term) ||
            desc.includes(term) ||
            sku.includes(term) ||
            category.includes(term)
          );
        });
          renderCards(filtered);
        }
      });

    } catch (error) {
      console.error('Error fetching items:', error);
      cardGallery.innerHTML = `<p style="color:red;">⚠️ Failed to load products: ${error.message}</p>`;
    }
  }

  // Event Listeners
  document.getElementById('addNewItemBtn')?.addEventListener('click', window.openNewItemForm);

  // Initialize
  init();
  updateAdminUI();
  updateCartBadge();
});