// hooks/useAuth.js
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearToken, getMe } from '../services/api';
import { logError } from '../utils/logger';

// A small cache so we don't hammer `/auth/me` on initial render when many components mount.
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

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // load current user once on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMeOnce();
        if (mounted) setUser(me);
      } catch (err) {
        const status = err?.response?.status;
        if (status !== 401) logError(err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // listen for auth events within the same tab
  useEffect(() => {
    const onLogin = async () => {
      try {
        const me = await getMe();
        _meValue = me;
        setUser(me);
      } catch (err) {
        const status = err?.response?.status;
        if (status !== 401) logError(err);
        _meValue = null;
        setUser(null);
      }
    };

    const onLogout = () => {
      _meValue = null;
      setUser(null);
      setReady(true);
    };

    window.addEventListener('auth:login', onLogin);
    window.addEventListener('auth:logout', onLogout);
    return () => {
      window.removeEventListener('auth:login', onLogin);
      window.removeEventListener('auth:logout', onLogout);
    };
  }, []);

  const logout = useCallback(() => {
    clearToken(); // services/api should emit auth:logout
    _meValue = null;
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, logout, setUser }), [user, ready, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
