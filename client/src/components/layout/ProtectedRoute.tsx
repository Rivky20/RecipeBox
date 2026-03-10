import { useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';

interface Props {
  children: ReactNode;
  adminOnly?: boolean;
}

// Small helper: opens modal then redirects to home
function OpenLoginAndRedirect() {
  const { openLogin } = useAuthModal();
  useEffect(() => { openLogin(); }, []);
  return <Navigate to="/" replace />;
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <OpenLoginAndRedirect />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
