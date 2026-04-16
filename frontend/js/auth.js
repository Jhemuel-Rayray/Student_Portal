// =============================================
// AUTH.JS — Shared authentication utilities
// =============================================

const API_BASE = 'http://localhost:3000/api';

// ---- Token Management ----
function getToken() { return localStorage.getItem('token'); }
function getUser()  { return JSON.parse(localStorage.getItem('user') || 'null'); }

function requireAuth() {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

function requireAdmin() {
  requireAuth();
  const user = getUser();
  if (user && user.role !== 'admin') {
    window.location.href = '/dashboard.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// ---- API Helper ----
async function apiCall(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ---- Sidebar Setup ----
function setupSidebar() {
  const user = getUser();
  if (!user) return;

  const avatarEl   = document.getElementById('sidebarAvatar');
  const usernameEl = document.getElementById('sidebarUsername');
  const roleEl     = document.getElementById('sidebarRole');
  const adminNav   = document.getElementById('nav-admin');

  const displayName = user.name || user.username;
  if (avatarEl)   avatarEl.textContent   = displayName.charAt(0).toUpperCase();
  if (usernameEl) usernameEl.textContent = displayName;
  if (roleEl)     roleEl.textContent     = user.role === 'admin' ? 'Administrator' : 'Student';
  if (adminNav && user.role === 'admin') adminNav.style.display = 'flex';
}

// ---- Sidebar Toggle (Mobile) ----
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// ---- Toast Notifications ----
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'none'; toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ---- Login Form (index.html only) ----
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  // Redirect if already logged in
  if (getToken() && getUser()) window.location.href = '/dashboard.html';

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorEl  = document.getElementById('loginError');
    const errorMsg = document.getElementById('loginErrorMsg');
    const btnText  = document.getElementById('loginBtnText');
    const spinner  = document.getElementById('loginSpinner');
    const arrow    = document.getElementById('loginArrow');
    const btn      = document.getElementById('loginBtn');

    errorEl.classList.remove('show');
    btnText.textContent = 'Signing in...';
    spinner.style.display = 'inline-block';
    arrow.style.display = 'none';
    btn.disabled = true;

    try {
      const data = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = data.user.role === 'admin' ? '/admin.html' : '/dashboard.html';
      }, 800);
    } catch (err) {
      errorMsg.textContent = err.message || 'Invalid username or password.';
      errorEl.classList.add('show');
      btnText.textContent = 'Sign In';
      spinner.style.display = 'none';
      arrow.style.display = 'inline';
      btn.disabled = false;
    }
  });
}

// Auto-setup sidebar on all non-login pages
if (!loginForm) {
  requireAuth();
  setupSidebar();
}
