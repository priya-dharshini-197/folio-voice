import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Copy, Check, ExternalLink, LogOut } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getGnaniStatus } from '../../services/gnaniVoice';

function Row({ label, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-3 border-b border-navy-800 last:border-b-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="text-sm text-slate-100 break-all sm:text-right">{children}</span>
        </div>
    );
}

export default function SettingsPage() {
    const { profile, logout } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [gnaniConfigured, setGnaniConfigured] = useState(null); // null = still checking
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState('');

    useEffect(() => {
        let cancelled = false;
        api
            .getMe()
            .then((me) => {
                if (cancelled) return;
                setEmail((me && me.user && me.user.email) || (me && me.email) || '');
            })
            .catch(() => { });
        getGnaniStatus().then((s) => {
            if (!cancelled) setGnaniConfigured(s.configured);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const username = profile && profile.username;
    const publicPath = username ? `/u/${username}` : '';
    const publicUrl = username ? `${window.location.origin}${publicPath}` : '';
    const browserSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    async function handleCopy() {
        setCopyError('');
        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            setCopyError('Could not copy automatically. Select the link and copy it manually.');
        }
    }

    async function handleLogout() {
        await logout();
        navigate('/login');
    }

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <div className="pb-2 border-b border-navy-800">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                    <Settings className="w-7 h-7 text-ice-400" />
                    <span>Settings</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">Your account, public link and voice options.</p>
            </div>

            {/* Account */}
            <GlassCard hoverEffect={false} className="space-y-2">
                <h3 className="text-lg font-bold text-white">Account</h3>
                <div>
                    <Row label="Name">{(profile && profile.full_name) || 'Not set yet'}</Row>
                    <Row label="Username">{username ? `@${username}` : 'Not set yet'}</Row>
                    <Row label="Email">{email || 'Not available'}</Row>
                </div>
                <p className="text-xs text-slate-500 pt-1">Edit your name and username on the Profile page.</p>
            </GlassCard>

            {/* Public portfolio link */}
            <GlassCard hoverEffect={false} className="space-y-3">
                <h3 className="text-lg font-bold text-white">Public portfolio link</h3>
                {username ? (
                    <>
                        <p className="text-xs text-slate-400">
                            Anyone can open this link without signing in. Only published projects, case studies and testimonials are shown.
                        </p>
                        <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800 text-sm text-ice-200 break-all select-all">
                            {publicUrl}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-semibold text-sm transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span>{copied ? 'Copied' : 'Copy link'}</span>
                            </button>
                            <a
                                href={publicPath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-100 text-sm border border-navy-700 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>Open portfolio</span>
                            </a>
                        </div>
                        {copyError && <p className="text-xs text-amber-300">{copyError}</p>}
                    </>
                ) : (
                    <p className="text-sm text-slate-400">Set a username on the Profile page to get your public link.</p>
                )}
            </GlassCard>

            {/* Voice */}
            <GlassCard hoverEffect={false} className="space-y-2">
                <h3 className="text-lg font-bold text-white">Voice assistant</h3>
                <div>
                    <Row label="Browser voice (Web Speech)">
                        {browserSpeech ? 'Supported in this browser' : 'Not supported in this browser. Typed commands still work.'}
                    </Row>
                    <Row label="Gnani AI voice (Prisma and Timbre)">
                        {gnaniConfigured === null
                            ? 'Checking...'
                            : gnaniConfigured
                                ? 'Set up on the server'
                                : 'Not set up. Add GNANI_API_KEY on the server.'}
                    </Row>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                    Choose the voice engine in the Voice & Commands panel at the bottom right.
                </p>
            </GlassCard>

            {/* Session */}
            <GlassCard hoverEffect={false} className="space-y-3">
                <h3 className="text-lg font-bold text-white">Session</h3>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                </button>
            </GlassCard>
        </div>
    );
}