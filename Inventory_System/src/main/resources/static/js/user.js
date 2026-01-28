// users.js — FINAL VERSION (role fixed)

function showAlert(message, type = 'success') {
  const div = document.createElement('div');
  div.className = `alert alert-${type} alert-dismissible fade show`;
  div.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.getElementById('alert-container').appendChild(div);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function fetchWithAuth(endpoint, options = {}) {
  const config = {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options
  };
  const url = 'http://localhost:8080' + endpoint;
  const res = await fetch(url, config);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

async function loadUsers() {
  try {
    document.getElementById('loading').classList.remove('d-none');
    const users = await fetchWithAuth('/api/admin/users');

    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
  // 🔥 FORCE role to be a string: extract .name if object, fallback to string
    let roleName;
    if (typeof user.role === 'object' && user.role !== null) {
      roleName = user.role.name || 'UNKNOWN';
    } else {
      roleName = String(user.role || 'UNKNOWN').trim().toUpperCase();
    }

    let badgeColor = 'secondary';
    if (roleName === 'ADMIN') badgeColor = 'danger';
    else if (roleName === 'MANAGER') badgeColor = 'info';
    else if (roleName === 'CONTROLLER') badgeColor = 'warning';
    else if (roleName === 'USER') badgeColor = 'success';

    let roleId = 4;
    if (roleName === 'ADMIN') roleId = 1;
    else if (roleName === 'MANAGER') roleId = 2;
    else if (roleName === 'CONTROLLER') roleId = 3;

    const row = `
      <tr>
        <td>${escapeHtml(user.name)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.phone)}</td>
        <td><span class="badge bg-${badgeColor}">${roleName}</span></td>
        <td>
          <select class="form-select form-select-sm role-select" data-id="${user.id}" style="width:auto;display:inline-block;">
            <option value="1" ${roleId === 1 ? 'selected' : ''}>ADMIN</option>
            <option value="2" ${roleId === 2 ? 'selected' : ''}>MANAGER</option>
            <option value="3" ${roleId === 3 ? 'selected' : ''}>CONTROLLER</option>
            <option value="4" ${roleId === 4 ? 'selected' : ''}>USER</option>
          </select>
          <button class="btn btn-sm btn-primary ms-2" onclick="updateRole(${user.id})">
            <i class="fas fa-save"></i>
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
  } catch (err) {
    console.error('Load users failed:', err);
    showAlert('❌ Failed to load users: ' + err.message, 'danger');
  } finally {
    document.getElementById('loading').classList.add('d-none');
  }
}

async function updateRole(userId) {
  const select = document.querySelector(`.role-select[data-id="${userId}"]`);
  const roleId = select.value;
  const selectedRoleName = select.options[select.selectedIndex].text;

  try {
    const users = await fetchWithAuth('/api/admin/users');
    const user = users.find(u => u.id === userId);
    const userName = user?.name || "Unknown User";

    await fetchWithAuth(`/api/admin/users/${userId}/role?roleId=${roleId}`, {
      method: 'PUT'
    });

    showAlert(`✅ Role updated for ${userName} → ${selectedRoleName}`, 'success');
    loadUsers();
  } catch (err) {
    showAlert(`❌ Update failed: ${err.message}`, 'danger');
  }
}

// MAIN INIT
(async () => {
  try {
    const user = await fetchWithAuth('/api/auth/me');

    const roleName = (user.role || '').trim().toUpperCase();
    console.log('Raw role:', JSON.stringify(user.role), '| Normalized:', roleName);

    if (roleName !== 'ADMIN') {
      const div = document.createElement('div');
      div.className = 'alert alert-warning alert-dismissible fade show';
      div.innerHTML = `
        ⚠️ <strong>Access Denied</strong> — Only administrators can manage users.<br>
        You are logged in as <strong>${escapeHtml(user.name)}</strong> (${roleName}).
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.getElementById('alert-container').appendChild(div);
      document.getElementById('users-table').classList.add('d-none');
      document.getElementById('loading').classList.add('d-none');
      return;
    }

    loadUsers();

  } catch (err) {
    console.error('Auth check failed:', err);
    const div = document.createElement('div');
    div.className = 'alert alert-danger alert-dismissible fade show';
    div.innerHTML = `
      🔒 You must be logged in to access this page.<br>
      Please <a href="/login.html" class="text-white fw-bold">log in</a>.
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.getElementById('alert-container').appendChild(div);
    document.getElementById('users-table').classList.add('d-none');
    document.getElementById('loading').classList.add('d-none');
  }
})();