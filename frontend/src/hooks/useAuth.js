
// hooks/useAuth.js
import { useEffect, useState, useCallback } from 'react';
import { getMe, getToken, clearToken } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        setUser(null);
        clearToken();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  
const logout = useCallback(async () => {
    try {
      // Si ton backend a un endpoint de logout (optionnel)
      // await postLogout();

      // On purge le token côté client
      clearToken?.();
    } finally {
      setUser(null);
    }
  }, []);

  return { user, ready, logout };
}
