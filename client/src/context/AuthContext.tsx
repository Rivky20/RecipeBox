import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import { authService } from '../services/authService';

const STORAGE_KEY = 'recipebox_user';
const USERNAMES_KEY = 'recipebox_usernames'; // { email: username }

function getStoredUsername(email: string): string {
  try {
    const map = JSON.parse(localStorage.getItem(USERNAMES_KEY) || '{}');
    return map[email] || email.split('@')[0];
  } catch {
    return email.split('@')[0];
  }
}

function saveUsername(email: string, username: string) {
  try {
    const map = JSON.parse(localStorage.getItem(USERNAMES_KEY) || '{}');
    map[email] = username;
    localStorage.setItem(USERNAMES_KEY, JSON.stringify(map));
  } catch {}
}

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

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    const username = getStoredUsername(data.email);
    setUser({ userId: data.userId, email: data.email, username, role: data.role, token: data.token });
  };

  const register = async (email: string, password: string, username: string) => {
    const data = await authService.register({ email, password });
    saveUsername(data.email, username);
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
