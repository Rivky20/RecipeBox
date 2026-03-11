import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import LoginModal from './components/layout/LoginModal';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import HomePage from './pages/HomePage';
import AlbumPage from './pages/AlbumPage';
import RecipePage from './pages/RecipePage';
import AddRecipePage from './pages/AddRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import FavoritesPage from './pages/FavoritesPage';

import AdminAlbumsPage from './pages/admin/AdminAlbumsPage';
import AdminRecipesPage from './pages/admin/AdminRecipesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';

const system = createSystem(defaultConfig, {
  globalCss: {
    body: {
      bg: '#FFFAF7',
      fontFamily: "'Nunito', sans-serif",
      color: '#1A1A1A',
    },
    'h1, h2, h3, h4, h5, h6': {
      fontFamily: "'Nunito', sans-serif",
    },
  },
});

function App() {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>
        <AuthModalProvider>
          <BrowserRouter>
            <LoginModal />
            <Routes>
              {/* Old auth routes → redirect to home (modal handles login/register) */}
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />

              {/* Public pages */}
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/albums/:id" element={<Layout><AlbumPage /></Layout>} />
              <Route path="/recipes/:id" element={<Layout><RecipePage /></Layout>} />

              {/* Protected pages */}
              <Route path="/recipes/new" element={
                <ProtectedRoute>
                  <Layout><AddRecipePage /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/recipes/:id/edit" element={
                <ProtectedRoute>
                  <Layout><EditRecipePage /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Layout><FavoritesPage /></Layout>
                </ProtectedRoute>
              } />

              {/* Admin pages */}
              <Route path="/admin/albums" element={
                <ProtectedRoute adminOnly>
                  <Layout><AdminAlbumsPage /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/recipes" element={
                <ProtectedRoute adminOnly>
                  <Layout><AdminRecipesPage /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute adminOnly>
                  <Layout><AdminUsersPage /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/stats" element={
                <ProtectedRoute adminOnly>
                  <Layout><AdminStatsPage /></Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </AuthModalProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
