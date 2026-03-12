import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ModalMode = 'login' | 'register';

interface AuthModalContextValue {
  isOpen: boolean;
  mode: ModalMode;
  sessionExpired: boolean;
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
  setMode: (m: ModalMode) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>('login');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handle = () => {
      setSessionExpired(true);
      setMode('login');
      setIsOpen(true);
    };
    window.addEventListener('session-expired', handle);
    return () => window.removeEventListener('session-expired', handle);
  }, []);

  const openLogin = () => { setMode('login'); setIsOpen(true); };
  const openRegister = () => { setMode('register'); setIsOpen(true); };
  const close = () => { setIsOpen(false); setSessionExpired(false); };

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, sessionExpired, openLogin, openRegister, close, setMode }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used inside AuthModalProvider');
  return ctx;
}
