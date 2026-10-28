import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  FolderKanban,
  Wrench,
  BookOpen,
  MessageSquareQuote,
  Mail,
  BarChart3,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const links = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
    { to: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
    { to: '/dashboard/skills', label: 'Skills', icon: Wrench },
    { to: '/dashboard/case-studies', label: 'Case Studies', icon: BookOpen },
    { to: '/dashboard/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { to: '/dashboard/messages', label: 'Messages', icon: Mail },
    { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="lg:hidden">
      {/* Top Mobile Bar */}
      <header className="h-16 px-4 bg-navy-900/90 backdrop-blur-md border-b border-navy-700/60 flex items-center justify-between fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-ice-500 to-sky-300 flex items-center justify-center text-navy-950 font-bold">
            <Sparkles className="w-4 h-4 fill-navy-950 text-navy-950" />
          </div>
          <span className="font-bold text-white tracking-tight">Folio Voice</span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl text-slate-300 hover:text-white bg-navy-800/80 border border-navy-700 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6 text-ice-400" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-navy-900 h-full p-6 flex flex-col z-10 border-r border-navy-700 shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-navy-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-ice-500 to-sky-300 flex items-center justify-center text-navy-950 font-bold">
                  <Sparkles className="w-4 h-4 fill-navy-950 text-navy-950" />
                </div>
                <span className="font-bold text-white tracking-tight">Folio Voice</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/dashboard'}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition
                      ${isActive
                        ? 'bg-ice-500/15 text-ice-300 border border-ice-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-navy-800'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-navy-700 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-ice-500/20 border border-ice-400/30 flex items-center justify-center text-ice-300 font-bold">
                  {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">@{profile?.username}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

