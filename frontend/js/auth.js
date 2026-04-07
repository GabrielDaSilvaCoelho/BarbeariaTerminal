const API_BASE = 'http://localhost:3000/api';

function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = './login.html';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
  };
}

function requireAuth() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = './login.html';
  }

  return user;
}

function requireRole(...roles) {
  const user = requireAuth();

  if (!roles.includes(user.role)) {
    if (user.role === 'cliente') {
      window.location.href = './dashboard-cliente.html';
    } else {
      window.location.href = './dashboard-admin.html';
    }
  }

  return user;
}