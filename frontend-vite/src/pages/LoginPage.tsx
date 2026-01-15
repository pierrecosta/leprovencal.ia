import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setToken, getApiErrorMessage } from '@/services/api';
import { toastSuccess, toastError } from '@/utils/notify';
import { ApiAlert } from '@/components/ApiAlert';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ username, password });
      setToken(res.access_token);
      toastSuccess('Connexion réussie !');
      navigate('/');
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg || 'Identifiants incorrects.');
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold text-heading mb-6 text-center">Connexion</h1>

        {error && <ApiAlert message={error} type="error" onDismiss={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Nom d'utilisateur</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre nom d'utilisateur"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Mot de passe</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
