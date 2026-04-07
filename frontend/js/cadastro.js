const form = document.getElementById('register-form');
const feedback = document.getElementById('feedback');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const confirmarSenha = document.getElementById('confirmarSenha').value.trim();

  if (senha !== confirmarSenha) {
    feedback.textContent = 'As senhas não coincidem.';
    feedback.className = 'feedback error';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao cadastrar.');
    }

    feedback.textContent = 'Cadastro realizado com sucesso. Redirecionando...';
    feedback.className = 'feedback success';

    setTimeout(() => {
      window.location.href = './login.html';
    }, 1500);
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'feedback error';
  }
});