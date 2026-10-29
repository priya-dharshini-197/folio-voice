import React from 'react';
import { GitBranch, Sparkles, ExternalLink, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';

export default function IntegrationsPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="pb-2 border-b border-navy-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <GitBranch className="w-7 h-7 text-ice-400" />
          <span>External Integrations</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Connect your GitHub repositories, external articles, and developer networks.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-ice-500/10 border border-ice-400/30 text-sm text-slate-200 flex items-start gap-3">
        <Clock className="w-5 h-5 text-ice-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white mb-0.5">Coming soon</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            GitHub repository import, the contribution heatmap, DEV articles and freelance opportunities are coming in the next update.
          </p>
        </div>
      </div>

      {/* GitHub Integration Card */}
      <GlassCard hoverEffect={false} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-navy-950 border border-navy-800 flex items-center justify-center text-white">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>GitHub Repositories & Activity</span>
                <span className="text-[10px] bg-navy-800 text-ice-400 border border-ice-400/20 px-2 py-0.5 rounded font-mono">
                  Coming soon
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Import public repositories into projects and visualize your 26-week contribution calendar.
              </p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldAlert className="w-4 h-4" />
            <span>Only real data is shown</span>
          </div>
        </div>

        {/* Status Explanation */}
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            GitHub import is coming soon. You will be able to connect your public GitHub username, choose repositories and import them as editable draft projects. Nothing is imported or published automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-1.5">
              <h4 className="text-xs font-semibold text-ice-300 uppercase tracking-wider">
                Repo Selection & Import
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fetch your public repositories, select projects, and import them directly as editable unpublished drafts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-1.5">
              <h4 className="text-xs font-semibold text-ice-300 uppercase tracking-wider">
                26-Week Heatmap
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Render an authentic GitHub GraphQL contribution calendar with ice-blue intensity levels.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

