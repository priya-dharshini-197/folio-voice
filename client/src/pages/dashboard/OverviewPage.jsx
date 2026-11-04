import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Wrench,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function OverviewPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    projectsCount: 0,
    publishedCount: 0,
    skillsCount: 0,
    completeness: { percentage: 0, checklist: [] }
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchOverview() {
      try {
        const [profileRes, projectsRes, skillsRes] = await Promise.all([
          api.getProfile(),
          api.getProjects(),
          api.getSkills()
        ]);

        if (mounted) {
          const published = projectsRes.filter(p => p.is_published).length;
          setStats({
            projectsCount: projectsRes.length,
            publishedCount: published,
            skillsCount: skillsRes.length,
            completeness: profileRes.completeness
          });
          setRecentProjects(projectsRes.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchOverview();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Welcome back, {profile?.full_name || 'Freelancer'}</span>
            <span className="text-xs bg-ice-500/15 text-ice-300 border border-ice-400/30 px-2.5 py-1 rounded-full font-mono">
              @{profile?.username}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here is what's happening with your portfolio workspace today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/projects"
            className="px-4 py-2 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-bold text-sm transition shadow-md shadow-ice-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </Link>
          <Link
            to="/dashboard/skills"
            className="px-4 py-2 rounded-xl glass-panel text-slate-200 hover:text-white text-sm font-medium transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Projects</p>
            <h3 className="text-3xl font-bold text-white mt-1">{loading ? '...' : stats.projectsCount}</h3>
            <p className="text-xs text-slate-400 mt-1">All portfolio entries</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-ice-400">
            <FolderKanban className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published</p>
            <h3 className="text-3xl font-bold text-emerald-400 mt-1">{loading ? '...' : stats.publishedCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Live for visitors</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills Showcase</p>
            <h3 className="text-3xl font-bold text-white mt-1">{loading ? '...' : stats.skillsCount}</h3>
            <p className="text-xs text-slate-400 mt-1">Self-reported proficiencies</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
            <Wrench className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profile Score</p>
            <h3 className="text-3xl font-bold text-ice-300 mt-1">
              {loading ? '...' : `${stats.completeness?.percentage || 0}%`}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Completeness rating</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ice-500/10 border border-ice-400/20 flex items-center justify-center text-ice-300">
            <UserCheck className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* Profile Completeness & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completeness Breakdown */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ice-400" />
              <h2 className="text-lg font-bold text-white">Profile Readiness Checklist</h2>
            </div>
            <Link
              to="/dashboard/profile"
              className="text-xs text-ice-400 hover:text-ice-300 font-semibold flex items-center gap-1 transition"
            >
              <span>Edit Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-navy-950 rounded-full h-3 overflow-hidden border border-navy-700">
            <div
              className="bg-gradient-to-r from-ice-500 to-sky-300 h-full rounded-full transition-all duration-700"
              style={{ width: `${stats.completeness?.percentage || 0}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {stats.completeness?.checklist?.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-navy-900/60 border border-navy-800 text-xs"
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400/80 flex-shrink-0" />
                )}
                <span className={item.done ? 'text-slate-300' : 'text-slate-400'}>{item.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Public Share & Voice Prompt Preview */}
        <GlassCard className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="w-5 h-5 text-ice-400" />
              <h2 className="text-lg font-bold text-white">Share Your Link</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Your public portfolio is ready at your personalized username slug. Share this with clients and recruiters.
            </p>
            <div className="p-3 rounded-xl bg-navy-950 border border-ice-400/20 text-xs font-mono text-ice-300 truncate select-all">
              /u/{profile?.username || 'username'}
            </div>
          </div>

          <div className="pt-4 border-t border-navy-800">
            <div className="p-3 rounded-xl bg-ice-500/10 border border-ice-400/20 text-xs text-slate-300">
              <span className="font-semibold text-ice-300">Phase 1 Status:</span> Profile, Projects, and Skills management are fully active with SQLite persistence.
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Projects Preview */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Projects</h2>
          <Link
            to="/dashboard/projects"
            className="text-xs text-ice-400 hover:text-ice-300 font-semibold flex items-center gap-1 transition"
          >
            <span>View All ({stats.projectsCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            <p>No projects added yet.</p>
            <Link
              to="/dashboard/projects"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-ice-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create your first project</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProjects.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-navy-900/60 border border-navy-700/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-semibold text-ice-400 bg-ice-500/10 px-2 py-0.5 rounded border border-ice-400/20">
                      {p.category}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${p.is_published
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white text-sm line-clamp-1">{p.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description || 'No description added.'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

