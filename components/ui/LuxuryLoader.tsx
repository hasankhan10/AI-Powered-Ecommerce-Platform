'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface LuxuryLoaderProps {
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  className?: string;
}

export function LuxuryLoader({
  label = 'Curating Experience...',
  sublabel = 'Maison Vale Atelier',
  size = 'md',
  className = '',
}: LuxuryLoaderProps) {
  if (size === 'fullscreen') {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary/90 backdrop-blur-md transition-all duration-300 ${className}`}>
        <LuxuryLoaderInner label={label} sublabel={sublabel} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <LuxuryLoaderInner label={label} sublabel={sublabel} />
    </div>
  );
}

function LuxuryLoaderInner({ label, sublabel }: { label: string; sublabel?: string }) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Animated Luxury Gold Geometry */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Soft Ambient Radiance */}
        <div className="absolute inset-0 rounded-full bg-accent-brass/20 blur-xl animate-pulse" />

        {/* Counter-rotating Outer Gold Rings */}
        <div
          className="absolute -inset-1.5 rounded-full border border-dashed border-accent-brass/40 animate-spin"
          style={{ animationDuration: '14s' }}
        />
        <div
          className="absolute inset-0 rounded-full border border-accent-brass/30 animate-spin"
          style={{ animationDuration: '8s', animationDirection: 'reverse' }}
        />

        {/* Inner Glowing Core with Sparkle */}
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-accent-brass bg-bg-deep shadow-lg shadow-accent-brass/10">
          <Sparkles size={20} className="text-accent-brass animate-pulse" />
        </div>
      </div>

      {/* Luxury Typography */}
      <div className="space-y-1 text-center">
        {sublabel && (
          <span className="block text-[9px] uppercase tracking-[0.3em] text-accent-brass/80 font-medium">
            {sublabel}
          </span>
        )}
        <h4 className="font-serif text-base font-light text-text-ondark tracking-wide">
          {label}
        </h4>
      </div>
    </div>
  );
}

export { ProductCardSkeleton } from '@/components/ui/Skeleton';
