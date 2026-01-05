// pages/Login.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiAlert from '../components/ApiAlert';
import { getApiErrorMessage, getMe, getRetryAfterSeconds, login } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [lockUntilMs, setLockUntilMs] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());

  const navigate = useNavigate();

  const lockedSeconds = useMemo(() => {
    const remaining = Math.ceil((lockUntilMs - nowMs) / 1000);
    return remaining > 0 ? remaining : 0;
  }, [lockUntilMs, nowMs]);

  const isLocked = lockedSeconds > 0;

  useEffect(() => {
    if (!isLocked) return;
    const t = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(t);
  }, [isLocked]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);
    setError('');

    try {
      if (!form.username.trim() || !form.password) {
        setError("Nom d’utilisateur et mot de passe requis.");
        return;
      }

      await login({ username: form.username.trim(), password: form.password });
      await getMe();
      navigate('/');
    } catch (err) {
      const status = err?.response?.status;

      if (status === 429) {
        const retryAfter = getRetryAfterSeconds(err) ?? 10;
        setLockUntilMs(Date.now() + retryAfter * 1000);
      }

      const msg = getApiErrorMessage(err);
      setError(
        msg ||
          (status === 429
            ? 'Trop de tentatives. Réessayez bientôt.'
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

      {isLocked && (
        <ApiAlert
          message={`Trop de tentatives. Réessayez dans ${lockedSeconds}s.`}
          kind="warning"
          className="mb-3"
        />
      )}
      {error && <ApiAlert message={error} kind="error" className="mb-3" />}

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
            disabled={loading || isLocked}
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
            disabled={loading || isLocked}
          />
        </div>

        <button
          type="submit"
          disabled={loading || isLocked}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {loading ? 'Connexion...' : isLocked ? `Attendre (${lockedSeconds}s)` : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}