import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

// Ice-blue intensity levels: 0 = no contributions, 4 = most
const LEVEL_COLORS = [
    'rgba(148, 163, 184, 0.14)',
    'rgba(56, 189, 248, 0.28)',
    'rgba(56, 189, 248, 0.5)',
    'rgba(56, 189, 248, 0.75)',
    'rgba(186, 230, 253, 1)',
];

function formatDay(isoDay) {
    const d = new Date(`${isoDay}T00:00:00Z`);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// 1 = Sunday ... 7 = Saturday (grid rows)
function gridRow(isoDay) {
    return new Date(`${isoDay}T00:00:00Z`).getUTCDay() + 1;
}

function describe(day) {
    const n = day.count;
    return `${formatDay(day.date)}: ${n} ${n === 1 ? 'contribution' : 'contributions'}`;
}

export default function ContributionHeatmap({ username }) {
    const [state, setState] = useState({ loading: true, error: '', data: null });
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setState({ loading: true, error: '', data: null });
        setSelected(null);
        api
            .getGithubContributions(username)
            .then((data) => {
                if (!cancelled) setState({ loading: false, error: '', data });
            })
            .catch((err) => {
                if (!cancelled) setState({ loading: false, error: err.message || 'Could not load contributions.', data: null });
            });
        return () => {
            cancelled = true;
        };
    }, [username]);

    const { loading, error, data } = state;

    return (
        <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-3">
            <h4 className="text-xs font-semibold text-ice-300 uppercase tracking-wider">
                Contribution activity (last 26 weeks)
            </h4>

            {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading contribution data...</span>
                </div>
            )}

            {!loading && error && (
                <div role="alert" className="flex items-start gap-2 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {!loading && data && data.available === false && (
                <p className="text-xs text-slate-400">
                    Contribution data not available.{' '}
                    {data.reason === 'token_rejected'
                        ? 'The server GitHub token was rejected.'
                        : 'The server needs a GitHub token to read it.'}
                </p>
            )}

            {!loading && data && data.available && (
                <>
                    {data.stale && (
                        <p className="text-xs text-amber-300">
                            Live data from GitHub is temporarily unavailable. Showing saved data.
                        </p>
                    )}

                    <div className="overflow-x-auto pb-1">
                        <div
                            role="group"
                            aria-label="Contribution heatmap"
                            className="grid w-max"
                            style={{
                                gridTemplateColumns: `repeat(${data.weeks.length}, 12px)`,
                                gridTemplateRows: 'repeat(7, 12px)',
                                gap: '3px',
                            }}
                        >
                            {data.weeks.map((week, wi) =>
                                week.map((day) => (
                                    <button
                                        key={day.date}
                                        type="button"
                                        title={describe(day)}
                                        aria-label={describe(day)}
                                        onClick={() => setSelected(day)}
                                        onMouseEnter={() => setSelected(day)}
                                        className="w-3 h-3 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ice-300"
                                        style={{
                                            gridColumn: wi + 1,
                                            gridRow: gridRow(day.date),
                                            backgroundColor: LEVEL_COLORS[day.level] || LEVEL_COLORS[0],
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                        <span>
                            {selected
                                ? describe(selected)
                                : `${data.totalContributions} ${data.totalContributions === 1 ? 'contribution' : 'contributions'} in the last ${data.weeksShown} weeks. Hover or tap a square for details.`}
                        </span>
                        <span className="flex items-center gap-1">
                            Less
                            {LEVEL_COLORS.map((c, i) => (
                                <span key={i} className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: c }} />
                            ))}
                            More
                        </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                        Data from GitHub · counts what GitHub reports for this account, which may differ from the graph on github.com
                    </p>
                </>
            )}
        </div>
    );
}