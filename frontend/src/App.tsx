import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import styled, { createGlobalStyle } from 'styled-components';
import { useAuthStore } from './store/authStore';

// Components
import { Sidebar } from './components/layout/Sidebar';
import { MusicPlayer } from './components/player/MusicPlayer';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Search } from './pages/Search';
import { Browse } from './pages/Browse';
import { LikedSongs } from './pages/LikedSongs';
import { Playlists } from './pages/Playlists';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { ArtistDashboard } from './pages/artist/ArtistDashboard';
import { UploadSong } from './pages/artist/UploadSong';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageUsers } from './pages/admin/ManageUsers';
import { PendingSongs } from './pages/admin/PendingSongs';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :root {
    /* Enhanced Primary Colors with Modern Gradients */
    --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
    --primary-gradient-hover: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%);
    --primary-gradient-light: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(217, 70, 239, 0.1) 100%);
    
    --secondary-gradient: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%);
    --secondary-gradient-hover: linear-gradient(135deg, #d97706 0%, #ea580c 50%, #dc2626 100%);
    
    --accent-gradient: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%);
    --accent-gradient-hover: linear-gradient(135deg, #0891b2 0%, #2563eb 50%, #4f46e5 100%);
    
    --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
    --warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    --danger-gradient: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    
    /* Enhanced Background System */
    --bg-primary: #fafbff;
    --bg-secondary: #f1f5f9;
    --bg-tertiary: #e2e8f0;
    --bg-card: rgba(255, 255, 255, 0.95);
    --bg-card-hover: rgba(255, 255, 255, 0.98);
    --bg-glass: rgba(255, 255, 255, 0.25);
    --bg-glass-strong: rgba(255, 255, 255, 0.4);
    --bg-overlay: rgba(0, 0, 0, 0.6);
    --bg-overlay-light: rgba(0, 0, 0, 0.1);
    
    /* Enhanced Text Colors */
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --text-tertiary: #94a3b8;
    --text-muted: #cbd5e1;
    --text-white: #ffffff;
    --text-accent: #6366f1;
    
    /* Enhanced Border System */
    --border-light: rgba(255, 255, 255, 0.2);
    --border-medium: #e2e8f0;
    --border-strong: #cbd5e1;
    --border-accent: rgba(99, 102, 241, 0.2);
    
    /* Enhanced Shadow System */
    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.12);
    --shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.15);
    --shadow-2xl: 0 20px 60px rgba(0, 0, 0, 0.18);
    --shadow-primary: 0 8px 25px rgba(99, 102, 241, 0.25);
    --shadow-secondary: 0 8px 25px rgba(245, 158, 11, 0.25);
    --shadow-accent: 0 8px 25px rgba(6, 182, 212, 0.25);
    --shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    
    /* Enhanced Glassmorphism */
    --glass-bg: rgba(255, 255, 255, 0.25);
    --glass-bg-strong: rgba(255, 255, 255, 0.4);
    --glass-border: rgba(255, 255, 255, 0.18);
    --glass-blur: blur(20px);
    --glass-blur-strong: blur(40px);
    
    /* Animation Variables */
    --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    --bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    
    /* Spacing System */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;
    
    /* Border Radius System */
    --radius-sm: 6px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --radius-2xl: 24px;
    --radius-full: 9999px;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
    background: var(--bg-primary);
    background-image: 
      linear-gradient(135deg, transparent 0%, rgba(99, 102, 241, 0.01) 100%);
    color: var(--text-primary);
    line-height: 1.6;
    min-height: 100vh;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    position: relative;
  }

  /* Enhanced Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--primary-gradient);
    border-radius: var(--radius-full);
    border: 2px solid var(--bg-secondary);
    transition: background var(--transition-normal);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--primary-gradient-hover);
  }

  ::-webkit-scrollbar-corner {
    background: var(--bg-secondary);
  }

  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: #6366f1 var(--bg-secondary);
  }

  /* Enhanced Selection */
  ::selection {
    background: rgba(99, 102, 241, 0.2);
    color: var(--text-primary);
  }

  ::-moz-selection {
    background: rgba(99, 102, 241, 0.2);
    color: var(--text-primary);
  }

  /* Focus Styles */
  :focus {
    outline: 2px solid var(--text-accent);
    outline-offset: 2px;
  }

  :focus:not(:focus-visible) {
    outline: none;
  }

  :focus-visible {
    outline: 2px solid var(--text-accent);
    outline-offset: 2px;
  }

  /* Typography Enhancements */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.025em;
    color: var(--text-primary);
  }

  h1 { font-size: 2.5rem; }
  h2 { font-size: 2rem; }
  h3 { font-size: 1.5rem; }
  h4 { font-size: 1.25rem; }
  h5 { font-size: 1.125rem; }
  h6 { font-size: 1rem; }

  p {
    line-height: 1.6;
    color: var(--text-secondary);
  }

  /* Link Styles */
  a {
    color: var(--text-accent);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  a:hover {
    color: var(--text-primary);
  }

  /* Button Reset */
  button {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
  }

  /* Input Styles */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }

  /* Utility Classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Smooth animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -15px, 0);
    }
    70% {
      transform: translate3d(0, -8px, 0);
    }
    90% {
      transform: translate3d(0, -2px, 0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }

  .animate-slideInLeft {
    animation: slideInLeft 0.5s ease-out;
  }

  .animate-slideInRight {
    animation: slideInRight 0.5s ease-out;
  }

  .animate-pulse {
    animation: pulse 2s infinite;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .animate-bounce {
    animation: bounce 1s infinite;
  }

  /* Reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  position: relative;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px; /* Account for fixed sidebar */
  overflow-y: auto;
  padding-bottom: 100px; /* Space for music player */
  min-height: 100vh;
`;

const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(217, 70, 239, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.02) 100%);
  position: relative;
  padding: var(--space-xl);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03' fill-rule='nonzero'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
    animation: float 20s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 10%;
    right: 10%;
    width: 200px;
    height: 200px;
    background: var(--primary-gradient-light);
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.6;
    animation: float 15s ease-in-out infinite reverse;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
`;

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole) {
    if (requireRole === 'artist' && user?.role !== 'artist' && user?.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    if (requireRole === 'admin' && user?.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Auth Route Component (redirect if already authenticated)
interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <GlobalStyle />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-light)',
          },
          success: {
            iconTheme: {
              primary: '#11998e',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff416c',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={
            <AuthRoute>
              <AuthContainer>
                <LoginForm />
              </AuthContainer>
            </AuthRoute>
          } />
          <Route path="/signup" element={
            <AuthRoute>
              <AuthContainer>
                <SignupForm />
              </AuthContainer>
            </AuthRoute>
          } />

          {/* Main Application Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <Dashboard />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />
          
          <Route path="/search" element={
            <ProtectedRoute>
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <Search />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />
          
          <Route path="/browse" element={
            <ProtectedRoute>
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <Browse />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />
          
          <Route path="/liked-songs" element={
            <ProtectedRoute>
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <LikedSongs />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />
          
          <Route path="/playlists" element={
            <ProtectedRoute>
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <Playlists />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />
          
          <Route path="/playlists/:id" element={
            <ProtectedRoute>
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <PlaylistDetail />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <Profile />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <Settings />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />

          {/* Artist Routes */}
          <Route path="/artist/dashboard" element={
            <ProtectedRoute requireRole="artist">
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <ArtistDashboard />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />
          
          <Route path="/artist/upload" element={
            <ProtectedRoute requireRole="artist">
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <UploadSong />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireRole="admin">
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <AdminDashboard />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute requireRole="admin">
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <ManageUsers />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/pending-songs" element={
            <ProtectedRoute requireRole="admin">
              <AppContainer>
                <Sidebar />
                <MainContent>
                  <PendingSongs />
                </MainContent>
                <MusicPlayer />
              </AppContainer>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </>
  );
}

export default App; 