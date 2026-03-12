import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import { authService } from '../services/authService';

const STORAGE_KEY = 'recipebox_user';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    const handle = () => setUser(null);
    window.addEventListener('session-expired', handle);
    return () => window.removeEventListener('session-expired', handle);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    const username = data.userName || email.split('@')[0];
    setUser({ userId: data.userId, email: data.email, username, role: data.role, token: data.token });
  };

  const register = async (email: string, password: string, username: string) => {
    const data = await authService.register({ email, password, userName: username });
    setUser({ userId: data.userId, email: data.email, username, role: data.role, token: data.token });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
