import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, Server, Globe, Cpu, LogOut, 
  Settings, Activity, Box
} from 'lucide-react';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { UserRole } from '@dataspace/common';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: RootState) => state.auth);

  const seekerItems = [
    { icon: Globe, label: 'Marketplace', path: '/seeker/discovery' },
    { icon: Box, label: 'My Fleet', path: '/seeker/fleet' },
    { icon: Activity, label: 'Telemetry', path: '#' },
    { icon: Settings, label: 'Settings', path: '#' },
  ];

  const offererItems = [
    { icon: LayoutDashboard, label: 'Global Console', path: '/offerer/dashboard' },
    { icon: Server, label: 'Resource Clusters', path: '#' },
    { icon: Activity, label: 'Operational Stats', path: '#' },
    { icon: Settings, label: 'Management', path: '#' },
  ];

  const navItems = user?.role === UserRole.OFFERER ? offererItems : seekerItems;

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#0F172A] border-r border-white/5 shadow-2xl z-20">
      <div className="p-8 border-b border-white/5 bg-[#0B0F1A]/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Cpu className="text-white" size={24} />
          </div>
          <div>
            <span className="text-xl font-bold text-white block leading-none">DataSpace</span>
            <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Enterprise Console</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => item.path !== '#' && navigate(item.path)}
            className={`flex items-center space-x-4 w-full px-6 py-4 rounded-xl transition-all group ${
              location.pathname === item.path 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={18} className={location.pathname === item.path ? 'text-white' : 'group-hover:text-blue-400'} />
            <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={() => dispatch(logout())} 
          className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all font-semibold group text-slate-500"
        >
          <LogOut size={18} className="group-hover:text-red-400" />
          <span className="text-xs uppercase tracking-widest font-bold">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};
