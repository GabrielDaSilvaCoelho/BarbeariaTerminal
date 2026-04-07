const form = document.getElementById('login-form');
const feedback = document.getElementById('feedback');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  feedback.textContent = 'Entrando...';
  feedback.className = 'feedback';

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login.');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    if (data.user.role === 'cliente') {
      window.location.href = './dashboard-cliente.html';
    } else {
      window.location.href = './dashboard-admin.html';
    }
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'feedback error';
  }
});