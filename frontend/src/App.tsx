import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import OrgChart from './pages/OrgChart';
import Profile from './pages/Profile';
import Departments from './pages/Departments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-dark-bg transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const LayoutWrapper: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'dashboard insights';
      case '/employees':
        return 'employee directory';
      case '/hierarchy':
        return 'reporting structure';
      case '/profile':
        return 'employee profile';
      case '/departments':
        return 'departments list';
      case '/reports':
        return 'statistical reports';
      case '/settings':
        return 'system settings';
      default:
        return 'employee portal';
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] dark:bg-dark-bg min-h-screen transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle()} />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]/50 dark:bg-dark-bg/50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            <Route path="/employees" element={
              user?.role === 'Super Admin' || user?.role === 'HR Manager' 
                ? <EmployeeList /> 
                : <Navigate to="/profile" replace />
            } />
            
            <Route path="/hierarchy" element={<OrgChart />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/departments" element={
              user?.role === 'Super Admin' ? <Departments /> : <Navigate to="/" replace />
            } />
            <Route path="/settings" element={
              user?.role === 'Super Admin' ? <Settings /> : <Navigate to="/" replace />
            } />
            
            <Route path="/reports" element={
              user?.role === 'Super Admin' || user?.role === 'HR Manager' ? <Reports /> : <Navigate to="/" replace />
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-dark-bg transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            } />

            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <LayoutWrapper />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
