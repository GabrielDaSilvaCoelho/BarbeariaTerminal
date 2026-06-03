import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Feedback from '../components/Feedback.jsx';
import { getApiError } from '../services/api.js';
import { registerRequest } from '../services/authService.js';

export default function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.senha !== form.confirmarSenha) {
      setFeedback({ message: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      await registerRequest({ nome: form.nome, email: form.email, senha: form.senha });
      setFeedback({ message: 'Cadastro realizado com sucesso. Redirecionando...', type: 'success' });

      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setFeedback({ message: getApiError(error, 'Erro ao cadastrar.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card large">
        <img
            src="/images/logo-barber.svg"
            alt="Logo BarberPro"
            className="login-logo"
          />
        <h1>Criar conta</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="nome">Nome</label>
          <input id="nome" name="nome" type="text" value={form.nome} onChange={handleChange} required />

          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />

          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" value={form.senha} onChange={handleChange} required />

          <label htmlFor="confirmarSenha">Confirmar senha</label>
          <input id="confirmarSenha" name="confirmarSenha" type="password" value={form.confirmarSenha} onChange={handleChange} required />

          <button type="submit" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</button>
        </form>

        <Feedback message={feedback.message} type={feedback.type} />

        <p className="link-text">
          Já possui conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
