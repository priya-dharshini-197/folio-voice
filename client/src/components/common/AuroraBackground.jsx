import React from 'react';

/**
 * Aurora Background Component
 * Provides smooth, GPU-accelerated shifting gradients and ambient glow behind all page content.
 */
export default function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="aurora-blob-1 animate-aurora-slow" />
      <div className="aurora-blob-2 animate-aurora-slow" style={{ animationDelay: '-12s' }} />
      <div className="aurora-blob-3 animate-pulse-subtle" />
    </div>
  );
}
