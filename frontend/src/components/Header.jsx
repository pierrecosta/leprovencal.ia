// components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand text-2xl">
          Le Provençal
        </Link>

        <nav className="nav-links">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/langue-dictionnaire" className="nav-link">Langue &amp; Dictionnaire</Link>
          <Link to="/geographie" className="nav-link">Géographie</Link>
          <Link to="/histoire-legendes" className="nav-link">Histoire &amp; Légendes</Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="nav-link opacity-90 cursor-default">
                Connecté : {user.username}
              </span>
              <button onClick={handleLogout} className="btn btn-accent" aria-label="Se déconnecter" title="Se déconnecter">
                Se déconnecter
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
