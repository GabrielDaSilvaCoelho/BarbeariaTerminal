import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Feedback from '../components/Feedback.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getApiError } from '../services/api.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setFeedback({ message: 'Entrando...', type: '' });

    try {
      const user = await login(form);

      if (user.role === 'cliente') {
        navigate('/dashboard-cliente', { replace: true });
      } else {
        navigate('/dashboard-admin', { replace: true });
      }
    } catch (error) {
      setFeedback({ message: getApiError(error, 'Erro ao fazer login.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
         <img
            src="/images/logo-barber.svg"
            alt="Logo BarberPro"
            className="login-logo"
          />
        <h1>BARBERPRO</h1>
        <p>Entre na sua conta</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />

          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" value={form.senha} onChange={handleChange} required />

          <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>

        <Feedback message={feedback.message} type={feedback.type} />

        <p className="link-text">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </main>
  );
}
