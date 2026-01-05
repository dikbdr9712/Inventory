// authNav.js

function updateNavbarForAuth() {
  const loginLink = document.getElementById('loginLink');
  
  // If no login link on this page, do nothing
  if (!loginLink) return;

  // Check login status
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const currentUser = localStorage.getItem('currentUser');

  if (isLoggedIn && currentUser) {
    loginLink.textContent = 'My Account';
    loginLink.href = 'profile.html';
  } else {
    loginLink.textContent = 'Login / Register';
    loginLink.href = 'login.html';
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateNavbarForAuth);
} else {
  updateNavbarForAuth();
}