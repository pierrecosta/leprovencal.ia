
// pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getMe } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ username: form.username, password: form.password });
      // Optionnel: vérifier le token en appelant /auth/me
      await getMe();
      // Rediriger après login
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Identifiants invalides ou erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow p-6 rounded">
      <h2 className="text-2xl font-bold mb-4 text-[var(--color-lavender)]">Se connecter</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nom d’utilisateur</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="votre pseudo"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-lavender)] text-white px-4 py-2 rounded hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Login'}
        </button>
      </form>
    </div>
  );
}