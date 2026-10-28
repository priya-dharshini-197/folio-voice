import React from 'react';

/**
 * Reusable Glassmorphism Card
 * Navy-900 base (60%), Ice-blue border and glow accent (40%), smooth hover elevation.
 */
export default function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        glass-panel rounded-2xl p-6 transition-all duration-300 relative overflow-hidden
        ${hoverEffect ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-ice-400/10' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Subtle top-edge glossy sheen */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-ice-400/30 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
