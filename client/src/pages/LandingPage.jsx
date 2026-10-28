import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Mic, Layout, Zap } from 'lucide-react';
import AuroraBackground from '../components/common/AuroraBackground';
import GlassCard from '../components/common/GlassCard';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 relative overflow-hidden flex flex-col justify-between">
      <AuroraBackground />

      {/* Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ice-500 to-sky-300 flex items-center justify-center text-navy-950 font-bold shadow-lg shadow-ice-500/20">
            <Sparkles className="w-5 h-5 fill-navy-950 text-navy-950" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Folio Voice</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-semibold text-sm transition shadow-lg shadow-ice-500/25 flex items-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-semibold text-sm transition shadow-lg shadow-ice-500/25"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ice-500/10 border border-ice-400/30 text-ice-300 text-xs font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5 text-ice-400" />
          <span>Next-Generation Freelance Portfolio Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          Build a portfolio that <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-ice-300 via-ice-400 to-sky-200 bg-clip-text text-transparent">
            works as hard as you do.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mb-10 leading-relaxed font-normal">
          Manage your projects, showcase your skills, track your portfolio engagement and use voice commands to navigate your professional workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-ice-400 to-ice-500 hover:from-ice-300 hover:to-ice-400 text-navy-950 font-bold text-base transition shadow-xl shadow-ice-400/20 flex items-center justify-center gap-2"
          >
            <span>{user ? "Open Dashboard" : "Claim Your Free Portfolio"}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-panel text-slate-200 hover:text-white font-medium text-base transition flex items-center justify-center"
          >
            Sign In to Account
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <GlassCard className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-ice-500/10 border border-ice-400/20 flex items-center justify-center text-ice-400">
              <Layout className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Curated Work & Skills</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Organize projects with live links, repository references, and self-reported skill proficiency ratings.
            </p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-ice-500/10 border border-ice-400/20 flex items-center justify-center text-ice-400">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Voice-Assisted Workflow</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Navigate, inspect views, and start project updates naturally with conversational voice commands.
            </p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-ice-500/10 border border-ice-400/20 flex items-center justify-center text-ice-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Hardened Privacy</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              JWT sessions secured in HTTP-only cookies with server-side ownership checks on every operation.
            </p>
          </GlassCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-navy-800/60 py-8 text-center text-xs text-slate-500">
        <p>Folio Voice © {new Date().getFullYear()} — "Your work. Your portfolio. Your voice."</p>
      </footer>
    </div>
  );
}

