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
        <div className="navbar-top">
          <div className="navbar-left">
            {user ? (
              <button onClick={handleLogout} className="btn btn-secondary" aria-label="Se déconnecter" title="Se déconnecter">
                Se déconnecter
              </button>
            ) : (
              <Link to="/login" className="btn btn-secondary" title="Se connecter">
                Se connecter
              </Link>
            )}
          </div>

          <div className="navbar-center">
            <Link to="/" className="nav-brand">
              Le Provençal
            </Link>
          </div>

          <div className="navbar-right">
            {user ? <span className="nav-link opacity-90 cursor-default">{user.username}</span> : <span />}
          </div>
        </div>

        <nav className="nav-links" aria-label="Navigation principale">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/langue-dictionnaire" className="nav-link">Langue &amp; Dictionnaire</Link>
          <Link to="/geographie" className="nav-link">Géographie</Link>
          <Link to="/histoire-legendes" className="nav-link">Histoire &amp; Légendes</Link>
        </nav>
      </div>
    </header>
  );
}
