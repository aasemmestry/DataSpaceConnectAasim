import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { RootState } from './store';
import { setAuth, setError } from './store/slices/authSlice';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { OffererDashboard } from './pages/OffererDashboard';
import { DiscoveryMap } from './pages/DiscoveryMap';
import { SeekerFleet } from './pages/SeekerFleet';
import { SeekerResourceDetails } from './pages/SeekerResourceDetails';
import { EnterpriseLayout } from './layouts/EnterpriseLayout';
import DatacenterDetail from './pages/DatacenterDetail';
import { AdminQueue } from './pages/AdminQueue';
import { UserRole } from '@dataspace/common';

const API_URL = '/api';

// Helper to determine where a user should go based on their role
const getDashboardPath = (role?: string) => {
  const r = role?.toUpperCase();
  if (r === UserRole.ADMIN) return '/admin/queue';
  if (r === UserRole.OFFERER) return '/offerer/dashboard';
  if (r === UserRole.SEEKER) return '/seeker/discovery';
  return '/';
};

function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, error } = useSelector((state: RootState) => state.auth);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && location.pathname === '/') {
      const path = getDashboardPath(user.role);
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  const handleLogin = async (data: any) => {
    try {
      const payload = { ...data, email: data.email.toLowerCase().trim() };
      const response = await axios.post(`${API_URL}/auth/login`, payload);
      dispatch(setAuth(response.data));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch(setError(message));
    }
  };

  const handleRegister = async (data: any) => {
    try {
      const regData = { 
        ...data, 
        email: data.email.toLowerCase().trim(),
        role: data.role.toUpperCase() 
      };
      await axios.post(`${API_URL}/auth/register`, regData);
      setIsRegistering(false);
      alert('Registration successful! Please login.');
    } catch (err: any) {
      dispatch(setError(err.response?.data?.message || 'Registration failed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-white text-2xl font-black italic">DS</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">DataSpace</h1>
          <p className="text-blue-200/60 mt-2 font-medium">
            {isRegistering ? 'Create your business account' : 'Welcome back, Partner'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <div className="space-y-4">
          {isRegistering ? (
            <RegisterForm onSubmit={handleRegister} />
          ) : (
            <LoginForm onSubmit={handleLogin} />
          )}
        </div>

        <button 
          onClick={() => {
            dispatch(setError(null));
            setIsRegistering(!isRegistering);
          }} 
          className="mt-8 text-sm text-blue-400 hover:text-blue-300 transition-colors w-full text-center font-semibold"
        >
          {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Join the network"}
        </button>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole: UserRole }) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  const userRole = user?.role?.toUpperCase();
  if (userRole !== allowedRole) {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route 
          path="/offerer/dashboard" 
          element={
            <ProtectedRoute allowedRole={UserRole.OFFERER}>
              <EnterpriseLayout>
                <OffererDashboard />
              </EnterpriseLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seeker/discovery" 
          element={
            <ProtectedRoute allowedRole={UserRole.SEEKER}>
              <EnterpriseLayout>
                <DiscoveryMap />
              </EnterpriseLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seeker/fleet" 
          element={
            <ProtectedRoute allowedRole={UserRole.SEEKER}>
              <EnterpriseLayout>
                <SeekerFleet />
              </EnterpriseLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seeker/node/:id" 
          element={
            <ProtectedRoute allowedRole={UserRole.SEEKER}>
              <EnterpriseLayout>
                <SeekerResourceDetails />
              </EnterpriseLayout>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}