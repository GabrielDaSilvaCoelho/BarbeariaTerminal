import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>404</h1>
        <p>Página não encontrada.</p>
        <Link to="/login">Voltar para o login</Link>
      </div>
    </main>
  );
}
