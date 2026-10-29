import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import AuroraBackground from '../common/AuroraBackground';
import VoiceAssistantPanel from '../voice/VoiceAssistantPanel';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 relative">
      <AuroraBackground />
      <Sidebar />
      <MobileNav />

      {/* Main Content Area */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col relative z-10">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Floating Voice & Command Assistant */}
      <VoiceAssistantPanel />
    </div>
  );
}
