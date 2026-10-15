import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';

const MainApp = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <DashboardView /> : <LoginView />;
};

export const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
