import React, { useState } from 'react';
import { Briefcase, Search, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import { api } from '../../services/api';

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatJobType(t) {
    return t ? t.replace(/_/g, ' ') : '';
}

export default function RemotiveJobs() {
    const [keywords, setKeywords] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    async function handleFetch(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await api.getRemotiveJobs(keywords.trim());
            setResult(data);
        } catch (err) {
            setResult(null);
            setError(err.message || 'Could not fetch jobs.');
        } finally {
            setLoading(false);
        }
    }

    const jobs = result?.jobs || [];

    return (
        <GlassCard hoverEffect={false} className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-navy-800">
                <div className="w-12 h-12 rounded-2xl bg-navy-950 border border-navy-800 flex items-center justify-center text-ice-400">
                    <Briefcase className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Freelance Opportunities</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Remote jobs from Remotive. Type skills separated by commas, or leave it empty to see everything available.
                    </p>
                </div>
            </div>

            <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <label htmlFor="remotive-keywords" className="sr-only">Skills or keywords</label>
                    <input
                        id="remotive-keywords"
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="For example: react, python, design"
                        maxLength={120}
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
                    <span>{loading ? 'Loading...' : 'Find Jobs'}</span>
                </button>
            </form>

            {error && (
                <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {loading && (
                <div className="space-y-3" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-20 rounded-xl bg-navy-950/70 border border-navy-800 animate-pulse" />
                    ))}
                </div>
            )}

            {!loading && result && (
                <div className="space-y-3">
                    {result.stale && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                            Live data from Remotive is temporarily unavailable. Showing saved data.
                        </div>
                    )}

                    <p className="text-xs text-slate-400">
                        Data from Remotive · {result.matchedCount} matching of {result.totalInFeed} jobs currently listed
                        {result.fetchedAt ? ` · updated ${new Date(result.fetchedAt).toLocaleTimeString()}` : ''}
                    </p>

                    {jobs.length === 0 ? (
                        <div className="p-6 rounded-xl bg-navy-950/70 border border-navy-800 text-center text-sm text-slate-400">
                            No jobs match these keywords right now. Try different skills, or leave the box empty.
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {jobs.map((j) => (
                                <li key={j.id} className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-1.5">
                                    <a
                                        href={j.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-start gap-1.5 text-sm font-semibold text-white hover:text-ice-300 break-words"
                                    >
                                        <span>{j.title}</span>
                                        <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    </a>
                                    <p className="text-xs text-slate-300">{j.company}</p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                                        {j.location && <span>Remote · {j.location}</span>}
                                        {j.jobType && <span className="capitalize">{formatJobType(j.jobType)}</span>}
                                        {j.salary && <span>{j.salary}</span>}
                                        {j.publishedAt && <span>Posted {formatDate(j.publishedAt)}</span>}
                                    </div>
                                    {j.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {j.tags.slice(0, 6).map((t) => (
                                                <span key={t} className="text-[11px] px-1.5 py-0.5 rounded bg-navy-800 text-ice-300 border border-ice-400/20">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {!loading && !result && !error && (
                <p className="text-xs text-slate-500">
                    Click Find Jobs to load the latest remote listings. Only real listings with their real Remotive links are shown.
                </p>
            )}
        </GlassCard>
    );
}