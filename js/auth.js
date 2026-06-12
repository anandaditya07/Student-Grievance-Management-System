// ===== Authentication Module =====
// Handles login, registration, session management, and role-based access

/**
 * Get the auth token from localStorage
 */
function getToken() {
  return localStorage.getItem('gms_token');
}

/**
 * Get current user data from localStorage
 */
function getCurrentUser() {
  try {
    const user = localStorage.getItem('gms_user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Get auth headers for API requests
 */
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

/**
 * Check authentication and role, redirect if unauthorized
 */
function checkAuth(requiredRole) {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    window.location.href = '/login.html';
    return false;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to correct dashboard
    if (user.role === 'admin') {
      window.location.href = '/admin/dashboard.html';
    } else {
      window.location.href = '/student/dashboard.html';
    }
    return false;
  }

  return true;
}

/**
 * Load user info into sidebar
 */
function loadUserInfo() {
  const user = getCurrentUser();
  if (!user) return;

  const nameEl = document.getElementById('user-display-name');
  const roleEl = document.getElementById('user-display-role');
  const avatarEl = document.getElementById('user-avatar');

  if (nameEl) nameEl.textContent = user.name || 'User';
  if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Administrator' : 'Student';
  if (avatarEl) avatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();
}

/**
 * Logout — clear session and redirect to login
 */
function logout() {
  localStorage.removeItem('gms_token');
  localStorage.removeItem('gms_user');
  window.location.href = '/login.html';
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  const url = API_BASE_URL + endpoint;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (response.status === 401) {
    // Token expired or invalid
    logout();
    return null;
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}
