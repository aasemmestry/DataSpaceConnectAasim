import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Device } from '@capacitor/device';
import { Map, Server, LayoutDashboard, User } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const info = await Device.getInfo();
        setIsMobile(info.platform === 'ios' || info.platform === 'android');
      } catch (e) {
        console.log('Not running in a native environment');
        setIsMobile(false);
      }
    };
    checkPlatform();
  }, []);

  if (!isMobile) return <>{children}</>;

  const navItems = [
    { name: 'Discover', icon: <Map size={20} />, path: '/seeker/discovery' },
    { name: 'Fleet', icon: <Server size={20} />, path: '/seeker/fleet' },
    { name: 'Profile', icon: <User size={20} />, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] pb-24">
      <main>{children}</main>
      
      {/* Fixed Bottom Navigation Bar for iOS/Android */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#161B2B]/80 backdrop-blur-xl border-t border-white/5 px-6 py-4 pb-8 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-all ${
              location.pathname === item.path ? 'text-blue-500 scale-110' : 'text-slate-500'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
