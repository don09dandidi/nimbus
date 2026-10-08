import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { MyFiles } from './pages/MyFiles';
import { Shared } from './pages/Shared';
import { RecycleBin } from './pages/RecycleBin';
import { Settings } from './pages/Settings';

const AuthenticatedApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determină tab-ul activ pe baza URL-ului
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/shared')) return 'shared';
    if (path.startsWith('/trash')) return 'trash';
    if (path.startsWith('/settings')) return 'settings';
    return 'files';
  };

  const handleSelectTab = (tab: 'dashboard' | 'files' | 'shared' | 'trash' | 'settings') => {
    navigate(`/${tab}`);
  };

  return (
    <AppLayout activeTab={getActiveTab()} onSelectTab={handleSelectTab}>
      <Routes>
        <Route path="/" element={<Navigate to="/files" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/files" element={<MyFiles />} />
        <Route path="/files/:folderId" element={<MyFiles />} />
        <Route path="/shared" element={<Shared />} />
        <Route path="/trash" element={<RecycleBin />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/files" replace />} />
      </Routes>
    </AppLayout>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useApp();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    const LoginComponent = Login as any;
    const RegisterComponent = Register as any;

    if (authView === 'login') {
      return <LoginComponent onNavigateToRegister={() => setAuthView('register')} />;
    }
    return <RegisterComponent onNavigateToLogin={() => setAuthView('login')} />;
  }

  return <AuthenticatedApp />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
