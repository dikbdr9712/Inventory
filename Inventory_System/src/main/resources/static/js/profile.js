// profile.js

document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const email = localStorage.getItem('currentUser');
  const name = localStorage.getItem('userName') || '—';
  const phone = localStorage.getItem('userPhone') || '—';
  const role = localStorage.getItem('userRole');

  // If not logged in, redirect to login
  if (!isLoggedIn || !email) {
    alert('Please log in first.');
    window.location.href = 'login.html';
    return;
  }

  // Display data
  document.getElementById('userName').textContent = name;
  document.getElementById('userEmail').textContent = email;
  document.getElementById('userPhone').textContent = phone;

  // Show role badge (optional)
  const roleElement = document.getElementById('userRole');
  if (roleElement) {
    roleElement.textContent = role;
    roleElement.style.color = role === 'ADMIN' ? '#e74c3c' : '#27ae60';
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    alert('Logged out successfully.');
    window.location.href = 'index.html';
  });

  // Edit profile (placeholder for now)
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    alert('Edit profile feature coming soon!');
    // Later: open form to update name/email/phone
  });
});