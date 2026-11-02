import React, { useState } from 'react';
import {
  GitBranch, Clock, ShieldAlert, Search, Loader2, Star, Download,
  AlertCircle, CheckCircle2, ExternalLink
} from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import { api } from '../../services/api';
import DevtoArticles from './DevtoArticles';
import RemotiveJobs from './RemotiveJobs';
import ContributionHeatmap from './ContributionHeatmap';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function IntegrationsPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { username, repos, fetchedAt, fromCache, stale }
  const [selected, setSelected] = useState(new Set());
  const [importResult, setImportResult] = useState(null);

  async function handleFetch(e) {
    e.preventDefault();
    const name = username.trim();
    if (!name) {
      setError('Enter a GitHub username first.');
      return;
    }
    setLoading(true);
    setError('');
    setImportResult(null);
    setSelected(new Set());
    try {
      const data = await api.getGithubRepos(name);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.message || 'Could not fetch repositories.');
    } finally {
      setLoading(false);
    }
  }

  function toggleRepo(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleImport() {
    if (!result || selected.size === 0) return;
    setImporting(true);
    setError('');
    setImportResult(null);
    try {
      const repos = Array.from(selected).map((id) => ({ id }));
      const data = await api.importGithubRepos({ username: result.username, repos });
      setImportResult(data);
      // Refresh the list so imported repos show the "already imported" tag
      const fresh = await api.getGithubRepos(result.username);
      setResult(fresh);
      setSelected(new Set());
    } catch (err) {
      setError(err.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  }

  const repos = result?.repos || [];
  const importable = repos.filter((r) => !r.alreadyImported);
  const totalStars = repos.reduce((sum, r) => sum + (r.stars || 0), 0);
  const languageCounts = repos.reduce((acc, r) => {
    if (r.language) acc[r.language] = (acc[r.language] || 0) + 1;
    return acc;
  }, {});
  const languageList = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]);

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

      {/* GitHub Integration Card */}
      <GlassCard hoverEffect={false} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-navy-950 border border-navy-800 flex items-center justify-center text-white">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">GitHub Repositories</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Fetch your public repositories and import the ones you want as editable draft projects.
              </p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldAlert className="w-4 h-4" />
            <span>Only real data is shown</span>
          </div>
        </div>

        {/* Username + Fetch */}
        <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="gh-username" className="sr-only">GitHub username</label>
            <input
              id="gh-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="GitHub username (for example: octocat)"
              maxLength={39}
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-xl bg-navy-950/70 border border-navy-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-ice-400 focus:ring-1 focus:ring-ice-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'Fetching...' : 'Fetch Repos'}</span>
          </button>
        </form>

        {/* Error */}
        {error && (
          <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Import success */}
        {importResult && (
          <div role="status" className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>
                Imported {importResult.created.length} {importResult.created.length === 1 ? 'repository' : 'repositories'} as
                unpublished drafts. Nothing is public until you publish it from the Projects page.
              </p>
              {importResult.skipped.length > 0 && (
                <p className="text-xs text-emerald-200/80 mt-1">
                  Skipped {importResult.skipped.length}: {importResult.skipped.map((s) => s.reason).join(' ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading placeholders */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-navy-950/70 border border-navy-800 animate-pulse" />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <div className="space-y-4">
            {result.stale && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                Live data from GitHub is temporarily unavailable. Showing saved data.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2">
                <h4 className="text-xs font-semibold text-ice-300 uppercase tracking-wider">
                  GitHub account
                </h4>
                {result.profile ? (
                  <p className="text-sm text-slate-200">
                    {result.profile.followers} followers · {result.profile.publicRepos} public repositories
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">Account details are not available right now.</p>
                )}
                <p className="text-[11px] text-slate-500">Data from GitHub</p>
              </div>

              <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2">
                <h4 className="text-xs font-semibold text-ice-300 uppercase tracking-wider">
                  Fetched repositories
                </h4>
                <p className="text-sm text-slate-200">
                  {totalStars} total {totalStars === 1 ? 'star' : 'stars'} across {repos.length} {repos.length === 1 ? 'repository' : 'repositories'}
                </p>
                {languageList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {languageList.map(([lang, count]) => (
                      <span key={lang} className="text-[11px] px-2 py-0.5 rounded bg-navy-800 text-ice-300 border border-ice-400/20">
                        {lang} · {count}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No languages reported by GitHub.</p>
                )}
                <p className="text-[11px] text-slate-500">Counts only the repositories listed below</p>
              </div>
            </div>
            <ContributionHeatmap username={result.username} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs text-slate-400">
                {repos.length} public {repos.length === 1 ? 'repository' : 'repositories'} for{' '}
                <span className="text-slate-200 font-medium">{result.username}</span>
                {' · '}Data from GitHub
                {result.fetchedAt ? ` · updated ${new Date(result.fetchedAt).toLocaleTimeString()}` : ''}
                {result.fromCache && !result.stale ? ' (saved a few minutes ago)' : ''}
              </p>
              {importable.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected(new Set(importable.map((r) => r.id)))}
                  className="text-xs text-ice-300 hover:text-ice-200 underline self-start sm:self-auto"
                >
                  Select all not yet imported
                </button>
              )}
            </div>

            {repos.length === 0 ? (
              <div className="p-6 rounded-xl bg-navy-950/70 border border-navy-800 text-center text-sm text-slate-400">
                This account has no public repositories.
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {repos.map((repo) => {
                  const checked = selected.has(repo.id);
                  return (
                    <li
                      key={repo.id}
                      className={`p-4 rounded-xl border space-y-2 transition-colors ${checked ? 'bg-ice-500/10 border-ice-400/60' : 'bg-navy-950/70 border-navy-800'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          id={`repo-${repo.id}`}
                          type="checkbox"
                          checked={checked}
                          disabled={repo.alreadyImported}
                          onChange={() => toggleRepo(repo.id)}
                          className="mt-1 w-4 h-4 accent-sky-400"
                        />
                        <div className="min-w-0 flex-1">
                          <label htmlFor={`repo-${repo.id}`} className="block text-sm font-semibold text-white break-words cursor-pointer">
                            {repo.name}
                          </label>
                          <p className="text-xs text-slate-400 mt-0.5 break-words">
                            {repo.description || 'No description on GitHub.'}
                          </p>
                        </div>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${repo.name} on GitHub`}
                          className="text-slate-400 hover:text-ice-300 flex-shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 pl-7">
                        {repo.language && <span className="text-ice-300">{repo.language}</span>}
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-3 h-3" /> {repo.stars}
                        </span>
                        {repo.updatedAt && <span>Updated {formatDate(repo.updatedAt)}</span>}
                        {repo.fork && <span>Fork</span>}
                        {repo.alreadyImported && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Already imported
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {repos.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-navy-800">
                <p className="text-xs text-slate-400">
                  {selected.size} selected. Imported repositories are saved as unpublished drafts that you can edit and publish later.
                </p>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={selected.size === 0 || importing}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{importing ? 'Importing...' : 'Import selected'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && !result && !error && (
          <p className="text-xs text-slate-500">
            Enter your public GitHub username and click Fetch Repos. Nothing is imported or published automatically.
          </p>
        )}
      </GlassCard>

      {/* Other integrations: not built yet */}
      <DevtoArticles />
      <RemotiveJobs />
      <div className="p-4 rounded-xl bg-ice-500/10 border border-ice-400/30 text-sm text-slate-200 flex items-start gap-3">
        <Clock className="w-5 h-5 text-ice-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white mb-0.5">Coming soon</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            The contribution heatmap and freelance opportunities are coming in the next update.          </p>
        </div>
      </div>
    </div>
  );
}