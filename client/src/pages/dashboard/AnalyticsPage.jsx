import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Calendar,
  FolderKanban,
  Wrench,
  BookOpen,
  MessageSquareQuote,
  Mail,
  ShieldAlert
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import GlassCard from '../../components/common/GlassCard';
import DevicePreview from '../../components/portfolio/DevicePreview';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const [range, setRange] = useState('7d'); // '7d' | '30d' | 'all'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics(selectedRange) {
    setLoading(true);
    try {
      const res = await api.getAnalytics(selectedRange);
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics(range);
  }, [range]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-900 border border-ice-400/40 p-3 rounded-xl shadow-xl text-xs">
          <p className="text-slate-400 font-mono mb-1">{label}</p>
          <p className="text-white font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ice-400" />
            <span>{payload[0].value} {payload[0].value === 1 ? 'view' : 'views'}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 max-w-7xl">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-ice-400" />
            <span>Engagement Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real visitor views deduplicated per session per day. Zero fabricated data.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 bg-navy-950 p-1.5 rounded-xl border border-navy-800 self-start sm:self-auto">
          <button
            onClick={() => setRange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              range === '7d'
                ? 'bg-ice-500 text-navy-950 shadow-md shadow-ice-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setRange('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              range === '30d'
                ? 'bg-ice-500 text-navy-950 shadow-md shadow-ice-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              range === 'all'
                ? 'bg-ice-500 text-navy-950 shadow-md shadow-ice-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Unique Views</p>
            <h3 className="text-3xl font-bold text-white mt-1">
              {loading ? '...' : data?.total_views || 0}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Deduplicated visitor days</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-ice-400">
            <Eye className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Views Today</p>
            <h3 className="text-3xl font-bold text-emerald-400 mt-1">
              {loading ? '...' : data?.views_today || 0}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Today's active visitors</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published Projects</p>
            <h3 className="text-3xl font-bold text-white mt-1">
              {loading ? '...' : data?.inventory?.published_projects || 0}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Visible on public portfolio</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
            <FolderKanban className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Inquiries</p>
            <h3 className="text-3xl font-bold text-ice-300 mt-1">
              {loading ? '...' : data?.inventory?.messages || 0}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {data?.inventory?.unread_messages ? `${data.inventory.unread_messages} unread` : 'All caught up'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ice-500/10 border border-ice-400/20 flex items-center justify-center text-ice-300">
            <Mail className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* Views Over Time Chart Card */}
      <GlassCard hoverEffect={false} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-navy-800">
          <div>
            <h2 className="text-lg font-bold text-white">Views Over Time</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Unique visitor sessions recorded by date.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {range === '7d' ? 'Past 7 Days' : range === '30d' ? 'Past 30 Days' : 'Lifetime Data'}
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-ice-400/20 border-t-ice-400 rounded-full animate-spin" />
          </div>
        ) : !data?.has_views ? (
          /* HONEST ZERO DATA STATE (No fake data!) */
          <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-navy-950/40 rounded-xl border border-navy-800/60 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-navy-800 flex items-center justify-center text-slate-500">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No views recorded yet</h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              When prospective clients visit your public portfolio at{' '}
              <span className="text-ice-400 font-mono">/u/{profile?.username}</span>, real engagement trends will appear here.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.views_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="iceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => {
                    const parts = val.split('-');
                    return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
                  }}
                />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#iceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      {/* INTERACTIVE DEVICE PREVIEW ("Public Page on Every Screen") */}
      <DevicePreview username={profile?.username} />
    </div>
  );
}

