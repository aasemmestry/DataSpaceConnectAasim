import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { RootState } from './store/index.js';
import { setAuth, setError } from './store/slices/authSlice.js';
import { LoginForm } from './components/LoginForm.js';
import { RegisterForm } from './components/RegisterForm.js';
import { OffererDashboard } from './pages/OffererDashboard.js';
import { DiscoveryMap } from './pages/DiscoveryMap.js';
import DatacenterDetail from './pages/DatacenterDetail.js';
import { AdminQueue } from './pages/AdminQueue.js';
import { UserRole } from '@dataspace/common';

const API_URL = 'http://localhost:5001/api';

function AuthPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, error } = useSelector((state: RootState) => state.auth);
  const [isRegistering, setIsRegistering] = useState(false);

  if (isAuthenticated && user) {
    if (user.role === UserRole.ADMIN) return <Navigate to="/admin/queue" />;
    return <Navigate to={user.role === UserRole.OFFERER ? "/offerer/dashboard" : "/seeker/discovery"} />;
  }

  const handleLogin = async (data: any) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data);
      dispatch(setAuth(response.data));
    } catch (err: any) {
      dispatch(setError(err.response?.data?.message || 'Login failed'));
    }
  };

  const handleRegister = async (data: any) => {
    try {
      await axios.post(`${API_URL}/auth/register`, data);
      setIsRegistering(false);
      alert('Registration successful! Please login.');
    } catch (err: any) {
      dispatch(setError(err.response?.data?.message || 'Registration failed'));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1 className="text-2xl font-bold mb-4">{isRegistering ? 'Create Account' : 'Login'}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isRegistering ? (
        <RegisterForm onSubmit={handleRegister} />
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
      <button 
        onClick={() => setIsRegistering(!isRegistering)} 
        className="mt-4 text-blue-500 underline w-full text-center"
      >
        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
    </div>
  );
}

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole: UserRole }) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) return <Navigate to="/" />;
  if (user?.role !== allowedRole) {
    if (user?.role === UserRole.ADMIN) return <Navigate to="/admin/queue" />;
    return <Navigate to={user?.role === UserRole.OFFERER ? "/offerer/dashboard" : "/seeker/discovery"} />;
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // Initialize Capacitor plugins for native feel
    const initCapacitor = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await SplashScreen.hide();
      } catch (e) {
        console.log('Not running in a native environment');
      }
    };
    initCapacitor();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route 
          path="/offerer/dashboard" 
          element={
            <ProtectedRoute allowedRole={UserRole.OFFERER}>
              <OffererDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seeker/discovery" 
          element={
            <ProtectedRoute allowedRole={UserRole.SEEKER}>
              <DiscoveryMap />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/queue" 
          element={
            <ProtectedRoute allowedRole={UserRole.ADMIN}>
              <AdminQueue />
            </ProtectedRoute>
          } 
        />
        <Route path="/datacenter/:id" element={<DatacenterDetail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
