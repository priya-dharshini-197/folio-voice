import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Wrench,
  BookOpen,
  MessageSquareQuote,
  BarChart3,
  GitBranch,
  Mail,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const activeLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
    { to: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
    { to: '/dashboard/skills', label: 'Skills', icon: Wrench },
    { to: '/dashboard/case-studies', label: 'Case Studies', icon: BookOpen },
    { to: '/dashboard/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { to: '/dashboard/messages', label: 'Messages', icon: Mail },
    { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/dashboard/integrations', label: 'Integrations', icon: GitBranch },
  ];

  const futureLinks = [
    { label: 'Voice Mode (Gnani AI)', icon: Sparkles, phase: 'Phase 5' },
    { label: 'Settings', icon: Settings, phase: 'Phase 5' },
  ];

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-navy-900/90 backdrop-blur-xl border-r border-navy-700/60 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-navy-700/50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ice-500 to-sky-300 flex items-center justify-center shadow-lg shadow-ice-500/20 text-navy-950 font-bold">
          <Sparkles className="w-5 h-5 fill-navy-950 text-navy-950" />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight">Folio Voice</span>
          <span className="block text-[11px] text-ice-400 font-medium tracking-wider uppercase">Workspace</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3 mb-2">
          Core Management
        </div>
        {activeLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-ice-500/15 text-ice-300 border border-ice-400/30 shadow-sm shadow-ice-400/10'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-6 text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 mb-2">
          Upcoming Phases
        </div>
        {futureLinks.map((link) => {
          const Icon = link.icon;
          return (
            <div
              key={link.label}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-500 cursor-not-allowed opacity-60"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </div>
              <span className="text-[10px] bg-navy-800 text-slate-400 px-1.5 py-0.5 rounded border border-navy-700">
                {link.phase}
              </span>
            </div>
          );
        })}
      </nav>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-navy-700/60 bg-navy-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-ice-500/20 border border-ice-400/40 flex items-center justify-center text-ice-300 font-semibold flex-shrink-0">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Freelancer'}</p>
              <p className="text-xs text-slate-400 truncate">@{profile?.username || 'user'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

