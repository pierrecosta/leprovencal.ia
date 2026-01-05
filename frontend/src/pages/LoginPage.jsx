// pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getMe, getApiErrorMessage } from '../services/api';

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
      const status = err?.response?.status;
      const backendMsg = getApiErrorMessage(err);
      const msg = typeof backendMsg === 'string' ? backendMsg : '';

      setError(
        msg ||
          (status === 429
            ? 'Trop de tentatives. Réessayez dans quelques instants.'
            : status === 401
              ? 'Identifiants invalides.'
              : 'Erreur de connexion. Réessayez.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 provence-card bg-white">
      <h2 className="text-2xl font-bold mb-4 text-secondary">Se connecter</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nom d’utilisateur</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={onChange}
            className="input"
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
            className="input"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}