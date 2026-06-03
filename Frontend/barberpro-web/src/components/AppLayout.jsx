import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function AppLayout({ title, children, menu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <img
        src="/images/logo-barber.svg"
        alt="Logo BarberPro"
        className="login-logo"
        />
        <h1>BARBERPRO</h1>
        <p>{user ? `${user.nome} (${user.role})` : ''}</p>

        <nav>
          {menu.map((item) => (
            <NavLink key={item.to} className="nav-btn" to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="btn-danger" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      <main className="content">
        <header className="topbar">
          <h2>{title}</h2>
        </header>

        {children}
      </main>
    </div>
  );
}
