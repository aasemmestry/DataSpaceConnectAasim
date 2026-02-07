import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/index.js';
import { logout } from '../store/slices/authSlice.js';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '@dataspace/common';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-blue-600">{user?.companyName || 'DataSpace'}</h2>
          <p className="text-sm text-gray-500">Welcome, {user?.fullName || user?.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-gray-600 hover:text-red-500 font-medium"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r hidden md:block">
          <nav className="p-4 space-y-2">
            {user?.role === UserRole.OFFERER && (
              <>
                <Link to="/offerer/dashboard" className="block p-2 rounded bg-blue-50 text-blue-700 font-medium">
                  Dashboard
                </Link>
                <Link to="/offerer/inventory" className="block p-2 rounded text-gray-600 hover:bg-gray-50">
                  Inventory
                </Link>
              </>
            )}
            {user?.role === UserRole.ADMIN && (
              <Link to="/admin/queue" className="block p-2 rounded bg-red-50 text-red-700 font-medium">
                Admin Queue
              </Link>
            )}
            {user?.role === UserRole.SEEKER && (
              <Link to="/seeker/discovery" className="block p-2 rounded text-gray-600 hover:bg-gray-50">
                Discovery Map
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
