'use client';

import { createContext, useCallback, useContext, useMemo, ReactNode, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refresh: () => void;
}

/**
 * ReadInfinity is an offline distribution. The auth-shaped context remains
 * available for shared components that still import `useAuth`, but it never
 * contacts Supabase, persists credentials, or reports a signed-in user.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Remove credentials that may have been left by an earlier Readest build.
    // This is deliberately local-only and does not call any remote auth API.
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }, []);

  const login = useCallback((_token: string, _user: User) => {
    console.warn('Login is disabled in the offline ReadInfinity build.');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }, []);

  const refresh = useCallback(() => {
    // Offline builds have no remote session to refresh.
  }, []);

  const value = useMemo(
    () => ({ token: null, user: null, login, logout, refresh }),
    [login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
