// authNav.js — Supports:
// - My Account link
// - Order List & Verify Payments (all pages)
// - View Messages (only on Contact page)
function initNavbar() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(updateNavbarForAuth, 300); // Wait for Bootstrap
    });
  } else {
    setTimeout(updateNavbarForAuth, 200);
  }
}

function updateNavbarForAuth() {
  const loginLink = document.getElementById('loginLink');
  const navList = document.querySelector('#navbarNav .navbar-nav');

  // If navbar or login link not found, retry later
  if (!navList || !loginLink) {
    setTimeout(updateNavbarForAuth, 100);
    return;
  }

  // Get user state from localStorage
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const currentUser = localStorage.getItem('currentUser');
  const userRole = localStorage.getItem('userRole');

  // Define roles with admin access
  const allowedRoles = ["ADMIN", "MANAGER", "CONTROLLER"];
  const hasAccess = allowedRoles.includes(userRole);

  // Remove any existing admin dropdown to avoid duplicates
  const existingDropdown = document.getElementById('admin-dropdown');
  if (existingDropdown) {
    existingDropdown.remove();
  }

  if (isLoggedIn && currentUser) {
    // Update login link → My Account
    loginLink.textContent = 'My Account';
    loginLink.href = 'profile.html'; // ← Ensure this matches your profile page filename

    // Add Admin Dropdown for authorized users
   if (hasAccess) {
      const dropdownLi = document.createElement('li');
      dropdownLi.id = 'admin-dropdown';
      dropdownLi.className = 'nav-item dropdown';

      // Use Bootstrap 4 syntax
      dropdownLi.innerHTML = `
        <a class="nav-link dropdown-toggle text-dark" href="#" id="adminDropdown" role="button" 
          data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fas fa-cogs"></i> Admin
        </a>
        <div class="dropdown-menu" aria-labelledby="adminDropdown">
          <a class="dropdown-item" href="pos.html">
            <i class="fas fa-shopping-cart mr-2"></i> Point of Sale
          </a>
          <a class="dropdown-item" href="pos-history.html">
            <i class="fas fa-history mr-2"></i> POS Sales History
          </a>
          <a class="dropdown-item" href="SalesDashboard.html">
            <i class="fas fa-sale mr-2"></i> Sales Dashboard
          </a>
          <a class="dropdown-item" href="order-list.html">
            <i class="fas fa-list mr-2"></i> Order List
          </a>
          <a class="dropdown-item" href="OrderVerification.html">
            <i class="fas fa-check-circle mr-2"></i> Verify Payments
          </a>
          <a class="dropdown-item" href="users.html">
            <i class="fas fa-user mr-2"></i> User Management
          </a>
        </div>
      `;

      navList.appendChild(dropdownLi);
    }

    // Special: Show "View Messages" only on Contact page (if element exists)
    const isContactPage = window.location.pathname.endsWith('Contact.html');
    if (isContactPage && hasAccess) {
      const adminBtnContainer = document.getElementById('adminButtonContainer');
      if (adminBtnContainer) {
        adminBtnContainer.style.display = 'block';
      }
    }

  } else {
    // Not logged in
    loginLink.textContent = 'Login / Register';
    loginLink.href = 'login.html';
  }
}

// Initialize navbar with multiple safety checks
function initNavbar() {
  if (document.readyState === 'loading') {
    // Wait for DOM
    document.addEventListener('DOMContentLoaded', () => {
      // Give Bootstrap time to render
      setTimeout(updateNavbarForAuth, 300);
    });
  } else {
    // DOM already loaded — run immediately with retries
    updateNavbarForAuth();
    setTimeout(updateNavbarForAuth, 200);
    setTimeout(updateNavbarForAuth, 500);
  }
}

// Run on page load
initNavbar();

// Also run after full page load (images, etc.)
window.addEventListener('load', () => {
  setTimeout(updateNavbarForAuth, 100);
});

// Optional: Re-check on navigation (for SPA-like behavior)
window.addEventListener('hashchange', updateNavbarForAuth);