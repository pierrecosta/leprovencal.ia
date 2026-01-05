
// components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/'); // ou '/login' selon ta préférence
  };

  return (
    <header className="bg-white shadow-md p-4">
      {/* Logo + Titre */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/*< img src={olive} alt="Olive" className="w-12 h-12" />*/}
        <h1 className="text-4xl font-bold text-[var(--color-lavender)]">Le Provençal</h1>
        {/*<img src={lavender} alt="Lavande" className="w-12 h-12" />*/}
      </div>

      {/* Menu principal */}
      <nav className="flex items-center justify-center gap-8 text-xl font-semibold">
        <Link
          to="/"
          className="px-4 py-2 rounded hover:bg-[var(--color-sun)] hover:text-black transition"
        >
          Accueil
        </Link>
        <Link
          to="/langue-dictionnaire"
          className="px-4 py-2 rounded hover:bg-[var(--color-sun)] hover:text-black transition"
        >
          Langue &amp; Dictionnaire
        </Link>
        <Link
          to="/geographie"
          className="px-4 py-2 rounded hover:bg-[var(--color-sun)] hover:text-black transition"
        >
          Géographie
        </Link>
        <Link
          to="/histoire-legendes"
          className="px-4 py-2 rounded hover:bg-[var(--color-sun)] hover:text-black transition"
        >
          Histoire &amp; Légendes
        </Link>

        {/* Spacer + bouton Login à droite */}
        <div className="flex-1" />     
        {user ? (
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded hover:bg-[var(--color-sun)] hover:text-black transition">
              Connecté : {user.username}, 
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-[var(--color-lavender)] text-black hover:bg-[var(--color-sun)] hover:text-black transition"
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded hover:bg-[var(--color-sun)] hover:text-black transition"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
