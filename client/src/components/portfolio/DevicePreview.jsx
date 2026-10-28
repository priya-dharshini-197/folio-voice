import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, RefreshCw } from 'lucide-react';
import GlassCard from '../common/GlassCard';

export default function DevicePreview({ username }) {
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'phone'
  const [iframeKey, setIframeKey] = useState(0);

  const deviceConfigs = {
    desktop: {
      label: 'Desktop View',
      width: 'w-full max-w-5xl',
      height: 'h-[620px]',
      icon: Monitor,
      specs: '1280px × 800px (100% responsive)'
    },
    tablet: {
      label: 'Tablet View (iPad)',
      width: 'w-[768px] max-w-full',
      height: 'h-[620px]',
      icon: Tablet,
      specs: '768px × 1024px (Portrait)'
    },
    phone: {
      label: 'Phone View (Mobile)',
      width: 'w-[375px] max-w-full',
      height: 'h-[620px]',
      icon: Smartphone,
      specs: '375px × 812px (iPhone)'
    }
  };

  const current = deviceConfigs[device];
  const previewUrl = `/u/${username || 'username'}`;

  return (
    <GlassCard hoverEffect={false} className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-700/60">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Monitor className="w-5 h-5 text-ice-400" />
            <span>Public Page on Every Screen</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Test how your published portfolio renders across desktop, tablet, and mobile displays.
          </p>
        </div>

        {/* Device Switcher Buttons */}
        <div className="flex items-center gap-2 bg-navy-950 p-1.5 rounded-xl border border-navy-800">
          <button
            onClick={() => setDevice('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              device === 'desktop'
                ? 'bg-ice-500 text-navy-950 shadow-md shadow-ice-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop</span>
          </button>

          <button
            onClick={() => setDevice('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              device === 'tablet'
                ? 'bg-ice-500 text-navy-950 shadow-md shadow-ice-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>Tablet</span>
          </button>

          <button
            onClick={() => setDevice('phone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              device === 'phone'
                ? 'bg-ice-500 text-navy-950 shadow-md shadow-ice-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Phone</span>
          </button>
        </div>
      </div>

      {/* Frame Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-medium text-slate-300">{current.label}:</span>
          <span className="font-mono text-[11px] text-slate-500">{current.specs}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="flex items-center gap-1 hover:text-white transition"
            title="Reload preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>

          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-ice-400 hover:text-ice-300 font-semibold transition"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Actual Responsive Preview Container */}
      <div className="w-full flex justify-center py-4 bg-navy-950/70 rounded-2xl border border-navy-800/80 overflow-x-auto">
        <div
          className={`
            transition-all duration-300 border-4 border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl bg-navy-950
            ${current.width} ${current.height}
          `}
        >
          {/* Mock Browser/Device Header */}
          <div className="h-7 bg-navy-900 border-b border-navy-800 px-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex-1 max-w-sm mx-auto bg-navy-950 rounded px-2.5 py-0.5 text-[10px] text-slate-400 font-mono truncate text-center border border-navy-800">
              foliovoice.dev{previewUrl}
            </div>
          </div>

          {/* Embedded live preview */}
          <iframe
            key={iframeKey}
            src={previewUrl}
            title={`${current.label} Preview`}
            className="w-full h-[calc(100%-28px)] bg-navy-950"
          />
        </div>
      </div>
    </GlassCard>
  );
}
