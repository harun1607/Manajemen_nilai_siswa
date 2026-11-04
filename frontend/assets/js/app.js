// assets/js/app.js
// Shared utilities untuk semua halaman

const API = '/api';

// ─── Auth helpers ────────────────────────────────────────────
function getToken() { return localStorage.getItem('token'); }
function getUser()  { return JSON.parse(localStorage.getItem('user') || 'null'); }

function requireAuth(allowedRoles) {
  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = '/index.html';
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert('Akses ditolak.');
    window.location.href = '/index.html';
    return null;
  }
  return user;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// ─── API fetch wrapper ────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API + endpoint, { ...options, headers });
  const data = await res.json();

  if (res.status === 401 || res.status === 403) {
    logout();
    throw new Error(data.message);
  }
  return { ok: res.ok, status: res.status, data };
}

// ─── UI helpers ──────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const toastEl = document.getElementById('globalToast');
  if (!toastEl) return;
  const toastBody = toastEl.querySelector('.toast-body');
  toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
  toastBody.textContent = msg;
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
}

function setLoadingBtn(btn, loading, originalHTML) {
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Memproses...';
  } else {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

function getStatusBadge(status) {
  return status === 'Lulus'
    ? '<span class="badge bg-success">Lulus</span>'
    : '<span class="badge bg-danger">Tidak Lulus</span>';
}

function getGradeBadge(grade) {
  const colorMap = { A: 'success', B: 'primary', C: 'warning', D: 'orange', E: 'danger' };
  const color = colorMap[grade] || 'secondary';
  return `<span class="badge bg-${color}">${grade}</span>`;
}

// ─── Navbar user info ─────────────────────────────────────────
function renderUserInfo() {
  const user = getUser();
  if (!user) return;
  const el = document.getElementById('navUserInfo');
  if (el) {
    const roleLabel = { admin: 'Administrator', guru: 'Guru', siswa: 'Siswa' };
    el.innerHTML = `
      <i class="bi bi-person-circle me-1"></i>
      <strong>${user.nama}</strong>
      <span class="badge bg-light text-dark ms-1">${roleLabel[user.role]}</span>
    `;
  }
}

document.addEventListener('DOMContentLoaded', renderUserInfo);
