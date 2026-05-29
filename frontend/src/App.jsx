import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import FloatingBackground from './components/FloatingBackground';
import InstallPrompt from './components/InstallPrompt';
import UpdatePrompt from './components/UpdatePrompt';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ShareView = lazy(() => import('./pages/ShareView'));

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="flex-grow flex items-center justify-center text-main animate-pulse">Loading auth...</div>;
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden flex flex-col font-sans">
      {/* Global Animated Background */}
      <FloatingBackground />
      <InstallPrompt />
      <UpdatePrompt />

      <div className="relative z-10 flex-grow flex flex-col" style={{ position: 'relative', zIndex: 10 }}>
        <Suspense fallback={
          <div className="flex-grow flex items-center justify-center text-main">
            <div className="text-xl font-medium animate-pulse">Loading CalcNova...</div>
          </div>
        }>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/share/:id" element={<ShareView />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;
