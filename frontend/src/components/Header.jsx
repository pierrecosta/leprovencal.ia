
import { Link } from 'react-router-dom';
import olive from '../assets/olive.svg';
import lavender from '../assets/lavender.svg';

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4">
      {/* Logo + Titre */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <img src={olive} alt="Olive" className="w-12 h-12" />
        <h1 className="text-4xl font-bold text-[var(--color-lavender)]">Le Provençal</h1>
        <img src={lavender} alt="Lavande" className="w-12 h-12" />
      </div>

      {/* Menu principal */}
      <nav className="flex justify-center gap-8 text-xl font-semibold">
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
          Langue & Dictionnaire
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
          Histoire & Légendes
        </Link>
      </nav>
    </header>
  );
}
