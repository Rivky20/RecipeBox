import { createContext, useContext, useState, ReactNode } from 'react';

type ModalMode = 'login' | 'register';

interface AuthModalContextValue {
  isOpen: boolean;
  mode: ModalMode;
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
  setMode: (m: ModalMode) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>('login');

  const openLogin = () => { setMode('login'); setIsOpen(true); };
  const openRegister = () => { setMode('register'); setIsOpen(true); };
  const close = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, openLogin, openRegister, close, setMode }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used inside AuthModalProvider');
  return ctx;
}
