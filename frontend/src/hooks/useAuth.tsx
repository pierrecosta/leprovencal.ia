import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { User } from '@/types';
import { clearToken, getMe } from '@/services/api';

// Cache to avoid hammering /auth/me on initial render
let _mePromise: Promise<User> | null = null;
let _meValue: User | null = null;

async function getMeOnce(): Promise<User> {
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

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Load current user once on mount
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        const me = await getMeOnce();
        if (mounted) setUser(me);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status !== 401) console.error('Failed to fetch user:', err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setReady(true);
      }
    })();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for auth events within the same tab
  useEffect(() => {
    const onLogin = async () => {
      try {
        const me = await getMe();
        _meValue = me;
        setUser(me);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status !== 401) console.error('Failed to fetch user after login:', err);
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
    clearToken(); // Will emit auth:logout event
    _meValue = null;
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, logout, setUser }),
    [user, ready, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
