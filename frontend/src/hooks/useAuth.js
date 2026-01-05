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
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[auth] invalid token, clearing', err?.response?.status || 'unknown');
        setUser(null);
        clearToken();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const logout = useCallback(async () => {
    try {
      clearToken();
    } finally {
      setUser(null);
    }
  }, []);

  return { user, ready, logout };
}
