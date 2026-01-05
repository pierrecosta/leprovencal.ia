// hooks/useAuth.js
import { useEffect, useState, useCallback } from 'react';
import { clearToken, getMe, getToken } from '../services/api';
import { logError } from '../utils/logger';

// Ensure /auth/me is called once per page load even if useAuth() is used in many components.
let _mePromise = null;
let _meValue = null;

async function getMeOnce() {
  if (_meValue) return _meValue;
  if (!_mePromise) {
    _mePromise = getMe()
      .then((me) => {
        _meValue = me;
        return me;
      })
      .finally(() => {
        _mePromise = null;
      });
  }
  return _mePromise;
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onLogout = () => {
      setUser(null);
      setReady(true);
    };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }

    (async () => {
      try {
        const me = await getMeOnce();
        setUser(me);
      } catch (err) {
        logError(err);
        setUser(null);
        clearToken();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return { user, ready, logout };
}
