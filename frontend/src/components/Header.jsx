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
        <Link to="/" className="nav-brand">
          Le Provençal
        </Link>

        <nav className="nav-links" aria-label="Navigation principale">
          <div className="nav-menu">
            <Link to="/" className="nav-link">Accueil</Link>
            <Link to="/langue-dictionnaire" className="nav-link">Langue &amp; Dictionnaire</Link>
            <Link to="/geographie" className="nav-link">Géographie</Link>
            <Link to="/histoire-legendes" className="nav-link">Histoire &amp; Légendes</Link>
          </div>

          <div className="nav-auth">
            {user ? (
              <button
                onClick={handleLogout}
                className="nav-link nav-link-auth"
                aria-label="Se déconnecter"
                title={`Connecté: ${user.username}`}
                type="button"
              >
                Se déconnecter
              </button>
            ) : (
              <Link to="/login" className="nav-link nav-link-auth" title="Se connecter">
                Se connecter
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
