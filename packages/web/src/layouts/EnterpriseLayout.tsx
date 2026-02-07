import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { MobileLayout } from './MobileLayout';

interface EnterpriseLayoutProps {
  children: React.ReactNode;
}

export const EnterpriseLayout: React.FC<EnterpriseLayoutProps> = ({ children }) => {
  return (
    <MobileLayout>
      <div className="flex h-screen bg-[#0B0F1A] text-slate-300 overflow-hidden font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col relative overflow-hidden h-full">
          {children}
        </main>
      </div>
    </MobileLayout>
  );
};
